/**
 * chatDB.js — Supabase helpers for User ↔ Admin live chat
 * Uses `support_chats` table with Supabase Realtime for instant sync.
 */
import { supabase } from './supabase';

// ── User-side helpers ─────────────────────────────────────────────────────────

/**
 * User sends a message to admin
 */
export async function sendSupportMessage(userId, userName, message) {
  const { data, error } = await supabase
    .from('support_chats')
    .insert({
      user_id: userId,
      user_name: userName || 'User',
      sender_role: 'user',
      message: message.trim(),
      is_read: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Load all chat messages for a specific user (user-side)
 */
export async function getUserChatMessages(userId) {
  const { data, error } = await supabase
    .from('support_chats')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

/**
 * Subscribe to real-time chat updates for a specific user
 * Returns an unsubscribe function
 */
export function subscribeToChat(userId, onNewMessage) {
  const channel = supabase
    .channel(`support-chat-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'support_chats',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNewMessage(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Mark admin messages as read (user viewed them)
 */
export async function markAdminMessagesAsRead(userId) {
  const { error } = await supabase
    .from('support_chats')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('sender_role', 'admin')
    .eq('is_read', false);
  if (error) console.error('markAsRead error:', error);
}

// ── Admin-side helpers ────────────────────────────────────────────────────────

/**
 * Admin sends a reply to a specific user
 */
export async function sendAdminReply(userId, userName, message) {
  const { data, error } = await supabase
    .from('support_chats')
    .insert({
      user_id: userId,
      user_name: userName || 'User',
      sender_role: 'admin',
      message: message.trim(),
      is_read: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Get all unique users who have chatted, with their latest message
 * Returns array sorted by most recent message
 */
export async function getAdminChatList() {
  // Get all messages ordered by created_at desc
  const { data, error } = await supabase
    .from('support_chats')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const messages = data || [];

  // Group by user_id, keep latest message + count unread
  const userMap = new Map();
  for (const msg of messages) {
    if (!userMap.has(msg.user_id)) {
      userMap.set(msg.user_id, {
        user_id: msg.user_id,
        user_name: msg.user_name,
        last_message: msg.message,
        last_sender: msg.sender_role,
        last_time: msg.created_at,
        unread_count: 0,
        total_messages: 0,
      });
    }
    const entry = userMap.get(msg.user_id);
    entry.total_messages++;
    // Count unread messages from users (admin hasn't read them)
    if (msg.sender_role === 'user' && !msg.is_read) {
      entry.unread_count++;
    }
  }

  return Array.from(userMap.values());
}

/**
 * Load all messages for a specific user (admin-side view)
 */
export async function getAdminChatMessages(userId) {
  const { data, error } = await supabase
    .from('support_chats')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

/**
 * Mark user messages as read (admin viewed them)
 */
export async function markUserMessagesAsRead(userId) {
  const { error } = await supabase
    .from('support_chats')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('sender_role', 'user')
    .eq('is_read', false);
  if (error) console.error('markAsRead error:', error);
}

/**
 * Get total unread count for admin (all unread user messages)
 */
export async function getAdminUnreadCount() {
  const { count, error } = await supabase
    .from('support_chats')
    .select('id', { count: 'exact', head: true })
    .eq('sender_role', 'user')
    .eq('is_read', false);
  if (error) return 0;
  return count || 0;
}

/**
 * Subscribe to all new chat messages (admin-side)
 * Returns an unsubscribe function
 */
export function subscribeToAdminChats(onNewMessage) {
  const channel = supabase
    .channel('admin-support-chats')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'support_chats',
      },
      (payload) => {
        onNewMessage(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
