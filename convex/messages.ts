import { v } from "convex/values"
import { mutation, query } from "./_generated/server"


export const getChatMessages = query({
    args: {chatId: v.id("chats")},
    handler: async (ctx, args ) => {
        return await ctx.db
        .query("messages")
        .withIndex("by_chat_created", (q) => q.eq("chatId", args.chatId))
        .order("asc")
        .collect();
    }
})

export const addMessage = mutation({
    args: {
        chatId: v.id("chats"),
        role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
        content: v.string(),
        provider: v.optional(v.string()),
        model: v.optional(v.string()),
        metadata: v.optional(v.object({
            tokenCount: v.optional(v.number()),
            processingTime: v.optional(v.number()),
        })),
        createdAt: v.number(),
        updatedAt: v.number(),
        isComplete: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const messageId = await ctx.db.insert("messages", {
            chatId: args.chatId,
            role: args.role,
            content: args.content,
            provider: args.provider,
            model: args.model,
            metadata: args.metadata,
            isComplete: args.isComplete,
            createdAt: args.createdAt,
            updatedAt: args.updatedAt,
        })
        await ctx.db.patch(args.chatId, {
            updatedAt: args.updatedAt,
        });
        return messageId;
    },
})

export const updateMessageContent = mutation({
    args: {
        messageId: v.id("messages"),
        content: v.string(),
        isComplete: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.messageId, {
            content: args.content,
            updatedAt: Date.now(),
            ...(args.isComplete && { isComplete: true })
        });
    },
})

export const createStreamingMessage = mutation({
    args: {
        chatId: v.id("chats"),
        role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
        content: v.string(),
        provider: v.optional(v.string()),
        model: v.optional(v.string()),
        isComplete: v.optional(v.boolean()),
        createdAt: v.number(),
        updatedAt: v.number(),
    },
    handler: async (ctx, args) => {
        const messageId = await ctx.db.insert("messages", {
            chatId: args.chatId,
            role: args.role,
            content: args.content,
            provider: args.provider,
            model: args.model,
            isComplete: args.isComplete || false,
            createdAt: args.createdAt,
            updatedAt: args.updatedAt,
        });
        
        await ctx.db.patch(args.chatId, {
            updatedAt: args.updatedAt,
        });
        
        return messageId;
    },
})
