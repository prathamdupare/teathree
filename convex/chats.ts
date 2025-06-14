import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createChat = mutation({
    args: {
        title: v.string(),
        userId: v.string(),
        provider: v.string(),
    },
    handler: async (ctx, args) => {
        const chatId = await ctx.db.insert("chats", {
            title: args.title,
            userId: args.userId,
            currentProvider: args.provider,
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
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.chatId, {
            currentProvider: args.provider,
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
