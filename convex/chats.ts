import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { generateAPIUrl } from "../app/utils/utils";

export const createChat = mutation({
    args: {
        title: v.string(),
        userId: v.string(),
        provider: v.string(),
        model: v.string(),
    },
    handler: async (ctx, args) => {
        const chatId = await ctx.db.insert("chats", {
            title: args.title,
            userId: args.userId,
            currentProvider: args.provider,
            currentModel: args.model,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isArchived: false,
            isPinned: false,
        });
        return chatId;
    }
})

export const getUserChats = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("chats")
            .withIndex("by_user_updated", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();
    },
})

export const getChat = query({
    args: { chatId: v.id("chats") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.chatId)
    },
});

export const updateChatProvider = mutation({
    args: {
        chatId: v.id("chats"),
        provider: v.string(),
        model: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.chatId, {
            currentProvider: args.provider,
            currentModel: args.model,
            updatedAt: Date.now(),
        });
    }
});

export const updateChatTitle = mutation({
    args: {
        chatId: v.id("chats"),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.chatId, {
            title: args.title,
            updatedAt: Date.now(),
        });
    }
})

export const generateChatTitle= mutation({
    args: {
        chatId: v.id("chats"),
        userMessage: v.string(),
        provider: v.string(),
        model: v.string(),
    },
    handler: async (ctx, args) => {
        const prompt = `Based on this user message, generate a very short, concise title (max 5 words) that captures the main topic or intent. Don't use quotes. Message: "${args.userMessage}"`;
        try{

            const response = await fetch(generateAPIUrl('/api/chat'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    provider: args.provider,
                    model: args.model,
                }),
            });

            const data = await response.json();
            let title = data.content || 'New Chat';

            title = title.replace(/^"|"$/g, '').trim();
            if (title.length < 3) {
                if (args.userMessage.toLowerCase().includes('hi') || 
                    args.userMessage.toLowerCase().includes('hello')) {
                    title = 'Greeting Chat';
                } else {
                    title = `Chat about "${args.userMessage.slice(0, 20)}"`;
                }
            }

            await ctx.db.patch(args.chatId, {
                title,
                updatedAt: Date.now(),
            });

            
        } catch (error) {
            // Fallback to basic title if AI generation fails
            const fallbackTitle = args.userMessage
                .split('\n')[0]
                .slice(0, 50)
                .trim();
            
            await ctx.db.patch(args.chatId, {
                title: fallbackTitle,
                updatedAt: Date.now(),
            });

            return fallbackTitle;
        }
    }
})