import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { generateAPIUrl } from "../app/utils/utils";

export const createChat = mutation({
    args: {
        title: v.string(),
        userId: v.string(),
        provider: v.string(),
        model: v.string(),
        enableReasoning: v.optional(v.boolean()),
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
            enableReasoning: args.enableReasoning || false,
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

export const updateChatReasoning = mutation({
    args: {
        chatId: v.id("chats"),
        enableReasoning: v.boolean(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.chatId, {
            enableReasoning: args.enableReasoning,
            updatedAt: Date.now(),
        });
    }
})

export const pinChat = mutation({
    args: {
        chatId: v.id("chats"),
    },
    handler: async (ctx, args) => {
        const chat = await ctx.db.get(args.chatId);
        if (!chat) throw new Error("Chat not found");
        await ctx.db.patch(args.chatId, { 
            isPinned: !chat.isPinned,
            updatedAt: Date.now()
        });
    }
})

export const deleteChat = mutation({
    args: {
        chatId: v.id("chats"),
    },
    handler: async (ctx, args) => {
        // Check if the chat exists first
        const chat = await ctx.db.get(args.chatId);
        if (!chat) {
            // Chat doesn't exist, return gracefully
            return;
        }

        // Delete all messages in the chat
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_chat", q => q.eq("chatId", args.chatId))
            .collect();
        
        for (const message of messages) {
            await ctx.db.delete(message._id);
        }

        // Delete the chat itself
        await ctx.db.delete(args.chatId);
    }
});