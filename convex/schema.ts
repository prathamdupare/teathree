import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    chats: defineTable({
        title: v.string(),
        userId: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
        currentProvider: v.string(),
        currentModel: v.string(),
        isArchived: v.boolean(),
        isPinned: v.boolean(),
    })
    .index("by_user", ["userId"])
    .index("by_user_updated", ["userId", "isArchived"]),

    messages: defineTable({
        chatId: v.id("chats"),
        role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
        content: v.string(),
        provider: v.optional(v.string()),
        model: v.optional(v.string()),
        isComplete: v.optional(v.boolean()),
        createdAt: v.number(),
        updatedAt: v.number(), 
        metadata: v.optional(v.object({
            tokenCount: v.optional(v.number()),
            processingTime: v.optional(v.number()),
            finishReason: v.optional(v.string()),
        })),
    })
    .index("by_chat_created", ["chatId", "createdAt"])
    .index("by_chat", ["chatId"]),

    providers: defineTable({
        name: v.string(),
        displayName: v.string(),
        models: v.array(v.object({
            id: v.string(),
            name: v.string(),
            maxTokens: v.optional(v.number()),
        })),
        isActive: v.boolean(),
        apiKeyRequired: v.boolean(),
    })
});