import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAnalysisSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "sk-default_key"
});

export function registerRoutes(app: Express): Server {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const totalAnalyses = await storage.getAnalysesByUser(userId);
      const pendingAnalyses = await storage.getPendingAnalyses(userId);
      const completedAnalyses = await storage.getCompletedAnalyses(userId);
      
      const stats = {
        totalModules: 135,
        activeModules: 1,
        activeUsers: 847,
        aiRatio: "98.5%",
        systemStatus: "Çevrimiçi",
        uptime: "99.9%",
        totalAnalyses: totalAnalyses.length,
        pendingCount: pendingAnalyses.length,
        completedCount: completedAnalyses.length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Dashboard stats alınamadı" });
    }
  });

  // AI Alerts endpoint
  app.get("/api/alerts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const alerts = await storage.getRecentAlerts(10);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "AI uyarıları alınamadı" });
    }
  });

  // Mark alert as read
  app.post("/api/alerts/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const alertId = parseInt(req.params.id);
      await storage.markAlertAsRead(alertId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Uyarı işaretlenemedi" });
    }
  });

  // Get pending analyses
  app.get("/api/analyses/pending", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const pending = await storage.getPendingAnalyses(userId);
      res.json(pending);
    } catch (error) {
      res.status(500).json({ message: "Bekleyen analizler alınamadı" });
    }
  });

  // Get completed analyses (potential scores)
  app.get("/api/analyses/completed", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const completed = await storage.getCompletedAnalyses(userId, 10);
      res.json(completed);
    } catch (error) {
      res.status(500).json({ message: "Tamamlanmış analizler alınamadı" });
    }
  });

  // Create new analysis
  app.post("/api/analyses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertAnalysisSchema.parse(req.body);
      const userId = req.user!.id;
      
      const analysis = await storage.createAnalysis({
        ...validatedData,
        userId
      });
      
      res.status(201).json(analysis);
    } catch (error) {
      res.status(400).json({ message: "Analiz oluşturulamadı", error: error instanceof Error ? error.message : "Bilinmeyen hata" });
    }
  });

  // Start AI analysis for M001 module
  app.post("/api/analyses/:id/start", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const analysisId = parseInt(req.params.id);
      const analysis = await storage.getAnalysisById(analysisId);
      
      if (!analysis || analysis.userId !== req.user!.id) {
        return res.status(404).json({ message: "Analiz bulunamadı" });
      }
      
      if (analysis.status !== 'pending') {
        return res.status(400).json({ message: "Analiz zaten tamamlanmış" });
      }

      // Call OpenAI GPT-4 for product analysis
      const prompt = `Türkiye'deki e-ticaret pazarı için "${analysis.productName}" adlı ürünün potansiyel skorunu analiz et. 
      Kategori: ${analysis.category || 'Belirtilmemiş'}
      
      Lütfen aşağıdaki JSON formatında yanıt ver:
      {
        "score": 1-100 arası sayı,
        "recommendation": "Yüksek/Orta/Düşük",
        "reasoning": "Detaylı açıklama",
        "tags": ["tag1", "tag2", "tag3"],
        "marketTrend": "Pozitif/Nötr/Negatif",
        "competitionLevel": "Düşük/Orta/Yüksek",
        "profitPotential": "Yüksek/Orta/Düşük"
      }`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Sen Türkiye e-ticaret pazarı uzmanı bir AI asistanısın. Ürün potansiyel analizlerinde doğru ve gerçekçi değerlendirmeler yaparsın."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const aiAnalysis = JSON.parse(response.choices[0].message.content!);
      
      // Update analysis with AI results
      await storage.updateAnalysisScore(analysisId, aiAnalysis.score, aiAnalysis);
      
      // Create success alert
      await storage.createAlert({
        type: "success",
        title: "AI Analizi Tamamlandı",
        message: `"${analysis.productName}" için M001 modülü analizi başarıyla tamamlandı. Skor: %${aiAnalysis.score}`
      });
      
      res.json({ 
        success: true, 
        score: aiAnalysis.score,
        analysis: aiAnalysis 
      });
    } catch (error) {
      console.error("AI Analysis error:", error);
      
      // Create error alert
      await storage.createAlert({
        type: "warning",
        title: "AI Analizi Başarısız",
        message: "Analiz işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin."
      });
      
      res.status(500).json({ message: "AI analizi başarısız oldu", error: error instanceof Error ? error.message : "Bilinmeyen hata" });
    }
  });

  // AI Assistant chat endpoint
  app.post("/api/ai/chat", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Mesaj gerekli" });
      }

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Sen Trendwyse AI asistanısın. Türkiye e-ticaret pazarı, ürün analizi, tedarik zinciri ve AI destekli karar alma konularında uzman yardım sağlarsın. Türkçe yanıt ver."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      });

      const aiResponse = response.choices[0].message.content;
      
      res.json({ 
        response: aiResponse,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("AI Chat error:", error);
      res.status(500).json({ message: "AI asistan yanıt veremedi", error: error instanceof Error ? error.message : "Bilinmeyen hata" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
