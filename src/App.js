import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { CheckCircle, Circle, Plus, Trash2, Send, Target, ListTodo, MessageCircle, TrendingUp, LogOut, Trophy, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AccountabilityApp() {
  // --- AUTH & STATE ---
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('penguin_user') || null);
  const [users] = useState({ user1: 'Des', user2: 'Princess' });
  
  const [goals, setGoals] = useState([]);
  const [messages, setMessages] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [todos, setTodos] = useState([]); // Keep todos local or add Firebase similarly

  const [activeTab, setActiveTab] = useState('goals');
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [rewardText, setRewardText] = useState('');

  // --- AUTH FUNCTIONS ---
  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('penguin_user', user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('penguin_user');
  };

  // --- REAL-TIME DATA SYNC ---
  useEffect(() => {
    if (!currentUser) return;

    // Listen to Goals
    const qGoals = query(collection(db, "goals"), orderBy("createdAt", "desc"));
    const unsubGoals = onSnapshot(qGoals, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Listen to Messages
    const qMsgs = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    const unsubMsgs = onSnapshot(qMsgs, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Listen to Rewards
    const qRewards = query(collection(db, "rewards"), orderBy("createdAt", "desc"));
    const unsubRewards = onSnapshot(qRewards, (snapshot) => {
      setRewards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubGoals();
      unsubMsgs();
      unsubRewards();
    };
  }, [currentUser]);

  // --- DATABASE ACTIONS ---
  const addGoal = async () => {
    if (!newGoalText.trim() || !newGoalTarget) return;
    await addDoc(collection(db, "goals"), {
      text: newGoalText,
      target: parseInt(newGoalTarget),
      current: 0,
      userId: currentUser,
      createdAt: serverTimestamp()
    });
    setNewGoalText('');
    setNewGoalTarget('');
  };

  const updateGoal = async (id, inc) => {
    const goalRef = doc(db, "goals", id);
    const goal = goals.find(g => g.id === id);
    const newCount = Math.min(goal.target, Math.max(0, goal.current + inc));
    await updateDoc(goalRef, { current: newCount });
  };

  const deleteGoal = async (id) => {
    await deleteDoc(doc(db, "goals", id));
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await addDoc(collection(db, "messages"), {
      text: newMessage,
      from: currentUser,
      createdAt: serverTimestamp()
    });
    setNewMessage('');
  };

  const addReward = async () => {
    if (!rewardText.trim()) return;
    await addDoc(collection(db, "rewards"), {
      text: rewardText,
      from: currentUser,
      to: currentUser === 'user1' ? 'user2' : 'user1',
      claimed: false,
      createdAt: serverTimestamp()
    });
    setRewardText('');
  };

  const toggleReward = async (id, currentStatus) => {
    await updateDoc(doc(db, "rewards", id), { claimed: !currentStatus });
  };

  // --- UI LOGIC ---
  const otherUser = currentUser === 'user1' ? 'user2' : 'user1';
  const userGoals = goals.filter(g => g.userId === currentUser);
  const otherUserGoals = goals.filter(g => g.userId !== currentUser);

  const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -inset-[40%] bg-gradient-to-tr from-blue-600/20 via-purple-600/10 to-pink-600/20 blur-3xl animate-pulse" />
    </div>
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative">
        <AnimatedBackground />
        <div className="w-full max-w-sm p-10 bg-zinc-900/80 backdrop-blur-xl rounded-3xl text-center border border-white/10">
          <div className="text-6xl mb-6">🐧</div>
          <h1 className="text-4xl font-black text-white italic mb-10">PENGUIN</h1>
          <div className="space-y-4">
            <button onClick={() => handleLogin('user1')} className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase">{users.user1}</button>
            <button onClick={() => handleLogin('user2')} className="w-full py-5 bg-zinc-800 text-white font-black rounded-2xl uppercase">{users.user2}</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20 relative overflow-hidden">
      <AnimatedBackground />
      <div className="max-w-xl mx-auto px-6">
        <header className="flex justify-between items-center pt-12 pb-8">
          <h2 className="text-3xl font-black italic uppercase">🐧 {users[currentUser]}</h2>
          <button onClick={handleLogout} className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800"><LogOut /></button>
        </header>

        <nav className="flex gap-2 p-1.5 bg-zinc-900/70 backdrop-blur-xl rounded-3xl mb-10 sticky top-5 z-50 border border-white/5">
          {['goals', 'messages', 'rewards', 'progress'].map(id => (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex-1 flex justify-center py-3 rounded-2xl transition-all ${activeTab === id ? 'bg-zinc-800 text-blue-400' : 'text-zinc-500'}`}>
              {id === 'goals' && <Target />}
              {id === 'messages' && <MessageCircle />}
              {id === 'rewards' && <Gift />}
              {id === 'progress' && <TrendingUp />}
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {activeTab === 'goals' && (
              <>
                <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
                  <input className="w-full bg-zinc-800 rounded-2xl p-4 mb-3 text-white" placeholder="Goal Name..." value={newGoalText} onChange={e => setNewGoalText(e.target.value)} />
                  <div className="flex gap-3">
                    <input type="number" className="w-28 bg-zinc-800 rounded-2xl p-4 text-white" placeholder="Target" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} />
                    <button onClick={addGoal} className="flex-1 bg-blue-600 rounded-2xl font-black uppercase text-white">Add Goal</button>
                  </div>
                </div>
                {userGoals.map(goal => (
                  <div key={goal.id} className="bg-zinc-900 p-8 rounded-3xl border border-white/5">
                    <div className="flex justify-between mb-4">
                      <h4 className="text-2xl font-black italic uppercase">{goal.text}</h4>
                      <button onClick={() => deleteGoal(goal.id)} className="text-red-400"><Trash2 /></button>
                    </div>
                    <div className="h-3 bg-zinc-800 rounded-full overflow-hidden mb-6">
                      <div className="h-full bg-blue-500" style={{ width: `${(goal.current / goal.target) * 100}%` }} />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => updateGoal(goal.id, -1)} className="flex-1 py-4 bg-zinc-800 rounded-2xl font-black">-1</button>
                      <button onClick={() => updateGoal(goal.id, 1)} className="flex-1 py-4 bg-white text-black rounded-2xl font-black">+1</button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'messages' && (
              <div className="bg-zinc-900 rounded-3xl border border-white/5 flex flex-col h-[500px]">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.from === currentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${msg.from === currentUser ? 'bg-blue-600' : 'bg-zinc-800'}`}>
                        <p className="text-xs font-bold opacity-50">{users[msg.from]}</p>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-zinc-800 flex gap-2">
                  <input className="flex-1 bg-zinc-800 p-3 rounded-xl" placeholder="Send a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} />
                  <button onClick={sendMessage} className="bg-blue-600 p-3 rounded-xl"><Send /></button>
                </div>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="space-y-4">
                <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
                  <p className="text-xs font-black text-zinc-500 mb-2 uppercase">Reward {users[otherUser]}</p>
                  <div className="flex gap-2">
                    <input className="flex-1 bg-zinc-800 p-4 rounded-2xl" placeholder="e.g. Dinner on me..." value={rewardText} onChange={e => setRewardText(e.target.value)} />
                    <button onClick={addReward} className="bg-pink-600 px-6 rounded-2xl"><Plus /></button>
                  </div>
                </div>
                {rewards.map(r => (
                  <div key={r.id} className={`p-6 rounded-3xl border flex items-center justify-between ${r.claimed ? 'opacity-50 bg-black' : 'bg-zinc-900 border-pink-500/30'}`}>
                    <div>
                      <p className="text-xs font-black text-pink-500 uppercase">{users[r.from]} → {users[r.to]}</p>
                      <p className={`font-bold text-lg ${r.claimed ? 'line-through' : ''}`}>{r.text}</p>
                    </div>
                    <button onClick={() => toggleReward(r.id, r.claimed)} className="p-3 bg-zinc-800 rounded-xl">
                      {r.claimed ? <CheckCircle className="text-green-500" /> : <Gift />}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'progress' && (
              <div className="bg-zinc-900 rounded-3xl p-8 border border-white/5">
                <h3 className="text-2xl font-black mb-6 uppercase">{users[otherUser]}'s Progress</h3>
                <div className="space-y-6">
                  {otherUserGoals.map(goal => (
                    <div key={goal.id}>
                      <div className="flex justify-between text-sm mb-2 uppercase font-bold">
                        <span>{goal.text}</span>
                        <span className="text-pink-400">{Math.round((goal.current / goal.target) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500" style={{ width: `${(goal.current / goal.target) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AccountabilityApp;