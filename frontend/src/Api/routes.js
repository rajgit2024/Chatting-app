const mockUsers = [
  { id: 1, name: "John Doe", email: "john.doe@example.com", isVerified: true, status: "online" },
  { id: 2, name: "Sarah Johnson", email: "sarah.j@example.com", isVerified: true, status: "online" },
  { id: 3, name: "David Wilson", email: "david.w@example.com", isVerified: true, status: "away" },
  { id: 4, name: "Lisa Taylor", email: "lisa.t@example.com", isVerified: true, status: "offline" },
  { id: 5, name: "Robert Brown", email: "robert.b@example.com", isVerified: true, status: "online" },
]

const mockChats = [
  { id: 1, name: "Team Project Discussion", isGroup: true, createdBy: 1, createdAt: new Date(Date.now() - 3600000 * 48) },
  { id: 2, name: "Sarah Johnson", isGroup: false, createdBy: 1, createdAt: new Date(Date.now() - 3600000 * 72) },
  { id: 3, name: "Marketing Team", isGroup: true, createdBy: 3, createdAt: new Date(Date.now() - 3600000 * 96) },
  { id: 4, name: "David Wilson", isGroup: false, createdBy: 1, createdAt: new Date(Date.now() - 3600000 * 120) },
]

const mockChatMembers = [
  { id: 1, chatId: 1, userId: 1, isAdmin: true, joinedAt: new Date(Date.now() - 3600000 * 48) },
  { id: 2, chatId: 1, userId: 2, isAdmin: false, joinedAt: new Date(Date.now() - 3600000 * 47) },
  { id: 3, chatId: 1, userId: 3, isAdmin: false, joinedAt: new Date(Date.now() - 3600000 * 46) },
  { id: 4, chatId: 1, userId: 4, isAdmin: false, joinedAt: new Date(Date.now() - 3600000 * 45) },
  { id: 5, chatId: 2, userId: 1, isAdmin: true, joinedAt: new Date(Date.now() - 3600000 * 72) },
  { id: 6, chatId: 2, userId: 2, isAdmin: false, joinedAt: new Date(Date.now() - 3600000 * 72) },
  { id: 7, chatId: 3, userId: 1, isAdmin: false, joinedAt: new Date(Date.now() - 3600000 * 96) },
  { id: 8, chatId: 3, userId: 3, isAdmin: true, joinedAt: new Date(Date.now() - 3600000 * 96) },
  { id: 9, chatId: 3, userId: 4, isAdmin: false, joinedAt: new Date(Date.now() - 3600000 * 95) },
  { id: 10, chatId: 3, userId: 5, isAdmin: false, joinedAt: new Date(Date.now() - 3600000 * 94) },
  { id: 11, chatId: 4, userId: 1, isAdmin: true, joinedAt: new Date(Date.now() - 3600000 * 120) },
  { id: 12, chatId: 4, userId: 3, isAdmin: false, joinedAt: new Date(Date.now() - 3600000 * 120) },
]

const mockMessages = [
  { id: 1, chatId: 1, senderId: 2, content: "Hey everyone! How's the project coming along?", isRead: true, createdAt: new Date(Date.now() - 3600000 * 24) },
  { id: 2, chatId: 1, senderId: 1, content: "It's going well! I've finished the database schema and started working on the UI.", isRead: true, createdAt: new Date(Date.now() - 3600000 * 23) },
  { id: 3, chatId: 1, senderId: 3, content: "I've been working on the API endpoints. Should be done by tomorrow.", isRead: true, createdAt: new Date(Date.now() - 3600000 * 22) },
  { id: 4, chatId: 1, senderId: 4, content: "Great progress everyone! I'll schedule a team meeting for next week.", isRead: true, createdAt: new Date(Date.now() - 3600000 * 21) },
  { id: 5, chatId: 2, senderId: 2, content: "Hey John, do you have time to review my PR?", isRead: true, createdAt: new Date(Date.now() - 3600000 * 10) },
  { id: 6, chatId: 2, senderId: 1, content: "Sure, I'll take a look at it this afternoon.", isRead: true, createdAt: new Date(Date.now() - 3600000 * 9) },
  { id: 7, chatId: 2, senderId: 2, content: "Thanks! Let me know if you have any questions.", isRead: true, createdAt: new Date(Date.now() - 3600000 * 8) },
  { id: 8, chatId: 3, senderId: 3, content: "Team, we need to discuss the marketing strategy for Q3.", isRead: true, createdAt: new Date(Date.now() - 3600000 * 48) },
  { id: 9, chatId: 3, senderId: 1, content: "I agree. When are you all available?", isRead: true, createdAt: new Date(Date.now() - 3600000 * 47) },
  { id: 10, chatId: 3, senderId: 4, content: "I'm free on Thursday afternoon.", isRead: true, createdAt: new Date(Date.now() - 3600000 * 46) },
  { id: 11, chatId: 3, senderId: 5, content: "Thursday works for me too.", isRead: true, createdAt: new Date(Date.now() - 3600000 * 45) },
  { id: 12, chatId: 4, senderId: 3, content: "John, can we discuss the proposal tomorrow?", isRead: true, createdAt: new Date(Date.now() - 3600000 * 72) },
  { id: 13, chatId: 4, senderId: 1, content: "Yes, I'm available after 2 PM.", isRead: true, createdAt: new Date(Date.now() - 3600000 * 71) },
  { id: 14, chatId: 4, senderId: 3, content: "Perfect, I'll send a calendar invite.", isRead: true, createdAt: new Date(Date.now() - 3600000 * 70) },
]