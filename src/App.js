import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Plus, Trash2, Send, Target, ListTodo, MessageCircle, TrendingUp, LogOut, Trophy, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AccountabilityApp() {
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('penguin_user') || null);
  const [users] = useState({ user1: 'Des', user2: 'Princess' });
  
  const [goals, setGoals] = useState(() => JSON.parse(localStorage.getItem('penguin_goals')) || { user1: [], user2: [] });
  const [todos, setTodos] = useState(() => JSON.parse(localStorage.getItem('penguin_todos')) || { user1: [], user2: [] });
  const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem('penguin_messages')) || []);
  const [rewards, setRewards] = useState(() => JSON.parse(localStorage.getItem('penguin_rewards')) || []);

  const [activeTab, setActiveTab] = useState('goals');
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newTodoText, setNewTodoText] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [rewardText, setRewardText] = useState('');
  const [newSubgoalText, setNewSubgoalText] = useState('');
  const [newSubgoalDesc, setNewSubgoalDesc] = useState('');
  const [activeGoalId, setActiveGoalId] = useState(null);

  useEffect(() => {
    localStorage.setItem('penguin_goals', JSON.stringify(goals));
    localStorage.setItem('penguin_todos', JSON.stringify(todos));
    localStorage.setItem('penguin_messages', JSON.stringify(messages));
    localStorage.setItem('penguin_rewards', JSON.stringify(rewards));
    if (currentUser) localStorage.setItem('penguin_user', currentUser);
  }, [goals, todos, messages, rewards, currentUser]);

  const handleLogin = (user) => setCurrentUser(user);
  const handleLogout = () => { 
    setCurrentUser(null); 
    localStorage.removeItem('penguin_user'); 
  };

  const addGoal = () => {
    if (!newGoalText.trim() || !newGoalTarget) return;
    const newGoal = { 
      id: Date.now(), 
      text: newGoalText, 
      target: parseInt(newGoalTarget), 
      current: 0,
      subgoals: []
    };
    setGoals(prev => ({ ...prev, [currentUser]: [...prev[currentUser], newGoal] }));
    setNewGoalText(''); 
    setNewGoalTarget('');
  };

  const updateGoal = (id, inc) => {
    setGoals(prev => ({
      ...prev,
      [currentUser]: prev[currentUser].map(g => 
        g.id === id ? { ...g, current: Math.min(g.target, Math.max(0, g.current + inc)) } : g
      )
    }));
  };

  const deleteGoal = (id) => {
    setGoals(prev => ({
      ...prev,
      [currentUser]: prev[currentUser].filter(g => g.id !== id)
    }));
  };

  const addSubgoal = (goalId) => {
    if (!newSubgoalText.trim()) return;
    setGoals(prev => ({
      ...prev,
      [currentUser]: prev[currentUser].map(goal =>
        goal.id === goalId
          ? {
              ...goal,
              subgoals: [
                ...(goal.subgoals || []),
                {
                  id: Date.now(),
                  text: newSubgoalText,
                  description: newSubgoalDesc,
                  completed: false
                }
              ]
            }
          : goal
      )
    }));
    setNewSubgoalText('');
    setNewSubgoalDesc('');
  };

  const toggleSubgoal = (goalId, subgoalId) => {
    setGoals(prev => ({
      ...prev,
      [currentUser]: prev[currentUser].map(goal =>
        goal.id === goalId
          ? {
              ...goal,
              subgoals: goal.subgoals.map(sub =>
                sub.id === subgoalId ? { ...sub, completed: !sub.completed } : sub
              )
            }
          : goal
      )
    }));
  };

  const deleteSubgoal = (goalId, subgoalId) => {
    setGoals(prev => ({
      ...prev,
      [currentUser]: prev[currentUser].map(goal =>
        goal.id === goalId
          ? {
              ...goal,
              subgoals: goal.subgoals.filter(sub => sub.id !== subgoalId)
            }
          : goal
      )
    }));
  };

  const addTodo = () => {
    if (!newTodoText.trim()) return;
    const newTodo = { id: Date.now(), text: newTodoText, completed: false };
    setTodos(prev => ({ ...prev, [currentUser]: [...prev[currentUser], newTodo] }));
    setNewTodoText('');
  };

  const toggleTodo = (id) => {
    setTodos(prev => ({
      ...prev,
      [currentUser]: prev[currentUser].map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  };

  const deleteTodo = (id) => {
    setTodos(prev => ({
      ...prev,
      [currentUser]: prev[currentUser].filter(t => t.id !== id)
    }));
  };

  const addReward = () => {
    if (!rewardText.trim()) return;
    const newReward = { 
      id: Date.now(), 
      from: currentUser, 
      to: currentUser === 'user1' ? 'user2' : 'user1', 
      text: rewardText, 
      claimed: false 
    };
    setRewards(prev => [...prev, newReward]);
    setRewardText('');
  };

  const toggleReward = (id) => {
    setRewards(prev => prev.map(r => r.id === id ? { ...r, claimed: !r.claimed } : r));
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), from: currentUser, text: newMessage }]);
    setNewMessage('');
  };

  const otherUser = currentUser === 'user1' ? 'user2' : 'user1';
  const userGoals = goals[currentUser] || [];
  const userTodos = todos[currentUser] || [];
  const otherUserGoals = goals[otherUser] || [];

  // Background animated gradient
  const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -inset-[40%] bg-gradient-to-tr from-blue-600/20 via-purple-600/10 to-pink-600/20 blur-3xl animate-pulse" />
      <div className="absolute -inset-[40%] bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-fuchsia-500/10 blur-3xl animate-[spin_40s_linear_infinite]" />
    </div>
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm p-10 bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-white/10 text-center shadow-2xl"
        >
          <div className="text-6xl mb-6">🐧</div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter mb-10 uppercase">PENGUIN</h1>
          <div className="space-y-4">
            <button 
              onClick={() => handleLogin('user1')} 
              className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-blue-500 hover:text-white transition-all uppercase"
            >
              {users.user1}
            </button>
            <button 
              onClick={() => handleLogin('user2')} 
              className="w-full py-5 bg-zinc-800 text-white font-black rounded-2xl hover:bg-pink-500 transition-all uppercase"
            >
              {users.user2}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20 font-sans relative overflow-hidden">
      <AnimatedBackground />
      <div className="max-w-xl mx-auto px-6">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center pt-12 pb-8"
        >
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">🐧 {users[currentUser]}</h2>
          <button 
            onClick={handleLogout} 
            className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 hover:text-red-500"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </motion.header>

        <nav className="flex gap-2 p-1.5 bg-zinc-900/70 backdrop-blur-xl rounded-3xl mb-10 border border-white/5 sticky top-5 z-50">
          {['goals', 'todos', 'messages', 'rewards', 'progress'].map(id => (
            <button 
              key={id} 
              onClick={() => setActiveTab(id)} 
              className={`flex-1 flex justify-center py-3 rounded-2xl transition-all ${
                activeTab === id ? 'bg-zinc-800 text-blue-400' : 'text-zinc-500'
              }`}
            >
              {id === 'goals' && <Target className="w-5 h-5" />}
              {id === 'todos' && <ListTodo className="w-5 h-5" />}
              {id === 'messages' && <MessageCircle className="w-5 h-5" />}
              {id === 'rewards' && <Gift className="w-5 h-5" />}
              {id === 'progress' && <TrendingUp className="w-5 h-5" />}
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {activeTab === 'goals' && (
              <>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5"
                >
                  <input 
                    className="w-full bg-zinc-800 rounded-2xl p-4 mb-3 border-none ring-1 ring-white/10 text-white" 
                    placeholder="Goal Name..." 
                    value={newGoalText} 
                    onChange={e => setNewGoalText(e.target.value)} 
                  />
                  <div className="flex gap-3">
                    <input 
                      type="number" 
                      className="w-28 bg-zinc-800 rounded-2xl p-4 ring-1 ring-white/10 text-white" 
                      placeholder="Target" 
                      value={newGoalTarget} 
                      onChange={e => setNewGoalTarget(e.target.value)} 
                    />
                    <button 
                      onClick={addGoal} 
                      className="flex-1 bg-blue-600 rounded-2xl font-black uppercase text-white hover:scale-[1.02] transition-transform"
                    >
                      Add Goal
                    </button>
                  </div>
                </motion.div>

                {userGoals.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-zinc-500 py-12"
                  >
                    No goals yet. Add one above!
                  </motion.div>
                ) : (
                  userGoals.map(goal => (
                    <motion.div
                      key={goal.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="bg-zinc-900 p-8 rounded-3xl border border-white/5 shadow-2xl"
                    >
                      <div className="flex justify-between mb-6">
                        <h4 className="text-2xl font-black italic uppercase text-white">{goal.text}</h4>
                        <div className="flex gap-2">
                          {goal.current >= goal.target && <Trophy className="text-yellow-500 animate-bounce w-6 h-6" />}
                          <button 
                            onClick={() => deleteGoal(goal.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-zinc-400 mb-2">
                          <span>{goal.current} / {goal.target}</span>
                          <span className="text-blue-400 font-bold">{Math.round((goal.current / goal.target) * 100)}%</span>
                        </div>
                        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                            transition={{ duration: 0.6 }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mb-4">
                        <button 
                          onClick={() => updateGoal(goal.id, -1)} 
                          className="flex-1 py-4 bg-zinc-800 rounded-2xl font-black text-white hover:bg-zinc-700"
                        >
                          -1
                        </button>
                        <button 
                          onClick={() => updateGoal(goal.id, 1)} 
                          className="flex-1 py-4 bg-white text-black rounded-2xl font-black hover:bg-blue-500 hover:text-white transition-all"
                        >
                          +1
                        </button>
                      </div>

                      <div className="border-t border-zinc-800 pt-4">
                        <button
                          onClick={() => setActiveGoalId(activeGoalId === goal.id ? null : goal.id)}
                          className="text-sm text-blue-400 hover:text-blue-300 mb-3 font-medium"
                        >
                          {activeGoalId === goal.id ? '− Hide Steps' : '+ Add Steps'}
                        </button>

                        <AnimatePresence>
                          {activeGoalId === goal.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-3 mb-3 overflow-hidden"
                            >
                              <div className="bg-zinc-800/50 rounded-xl p-3 space-y-2">
                                <input
                                  type="text"
                                  value={newSubgoalText}
                                  onChange={(e) => setNewSubgoalText(e.target.value)}
                                  placeholder="Step name..."
                                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 text-sm"
                                />
                                <textarea
                                  value={newSubgoalDesc}
                                  onChange={(e) => setNewSubgoalDesc(e.target.value)}
                                  placeholder="Description (optional)..."
                                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 text-sm resize-none"
                                  rows="2"
                                />
                                <button
                                  onClick={() => addSubgoal(goal.id)}
                                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium text-sm hover:scale-[1.01] transition-transform"
                                >
                                  Add Step
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {goal.subgoals && goal.subgoals.length > 0 && (
                          <div className="space-y-2">
                            <AnimatePresence>
                              {goal.subgoals.map(subgoal => (
                                <motion.div
                                  key={subgoal.id}
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                  transition={{ duration: 0.25 }}
                                  className={`bg-zinc-800/30 rounded-lg p-3 ${subgoal.completed ? 'opacity-60' : ''}`}
                                >
                                  <div className="flex items-start gap-2">
                                    <button
                                      onClick={() => toggleSubgoal(goal.id, subgoal.id)}
                                      className="text-blue-400 hover:text-blue-300 transition duration-200 mt-0.5"
                                    >
                                      {subgoal.completed ? (
                                        <CheckCircle className="w-4 h-4" />
                                      ) : (
                                        <Circle className="w-4 h-4" />
                                      )}
                                    </button>
                                    <div className="flex-1">
                                      <p
                                        className={`text-sm font-medium ${subgoal.completed ? 'line-through text-zinc-500' : 'text-white'}`}
                                      >
                                        {subgoal.text}
                                      </p>
                                      {subgoal.description && (
                                        <p className="text-xs text-zinc-400 mt-1">
                                          {subgoal.description}
                                        </p>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => deleteSubgoal(goal.id, subgoal.id)}
                                      className="text-red-400/60 hover:text-red-300 transition duration-200"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </>
            )}

            {activeTab === 'todos' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-zinc-900 rounded-3xl p-6 border border-white/5 text-white" 
                    placeholder="New Task..." 
                    value={newTodoText} 
                    onChange={e => setNewTodoText(e.target.value)} 
                    onKeyPress={e => e.key === 'Enter' && addTodo()} 
                  />
                  <button
                    onClick={addTodo}
                    className="bg-blue-600 px-8 rounded-3xl font-black text-white hover:scale-[1.02] transition-transform"
                  >
                    <Plus />
                  </button>
                </div>
                {userTodos.length === 0 ? (
                  <div className="text-center text-zinc-500 py-12">No tasks yet</div>
                ) : (
                  <AnimatePresence>
                    {userTodos.map(todo => (
                      <motion.div
                        key={todo.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-4 bg-zinc-900 p-6 rounded-3xl border border-white/5"
                      >
                        <button onClick={() => toggleTodo(todo.id)}>
                          <CheckCircle className={todo.completed ? "text-blue-500 w-6 h-6" : "text-zinc-800 w-6 h-6"} />
                        </button>
                        <span className={`flex-1 font-bold ${todo.completed ? 'line-through text-zinc-600' : 'text-white'}`}>
                          {todo.text}
                        </span>
                        <button onClick={() => deleteTodo(todo.id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="space-y-4">
                <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">
                    Mint Reward for {users[otherUser]}
                  </h3>
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 bg-zinc-800 rounded-2xl p-4 text-white" 
                      placeholder="e.g. 1 Large Pizza..." 
                      value={rewardText} 
                      onChange={e => setRewardText(e.target.value)} 
                    />
                    <button onClick={addReward} className="bg-pink-600 px-6 rounded-2xl text-white hover:scale-[1.02] transition-transform">
                      <Plus />
                    </button>
                  </div>
                </div>
                {rewards.length === 0 ? (
                  <div className="text-center text-zinc-500 py-12">No rewards yet</div>
                ) : (
                  <AnimatePresence>
                    {rewards.map(r => (
                      <motion.div 
                        key={r.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className={`p-6 rounded-3xl border flex items-center justify-between ${
                          r.claimed 
                            ? 'bg-zinc-950 border-zinc-900 opacity-50' 
                            : 'bg-zinc-900 border-pink-500/30 shadow-lg shadow-pink-500/5'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-black text-pink-500 uppercase">
                            {users[r.from]} → {users[r.to]}
                          </p>
                          <p className={`font-bold text-lg text-white ${r.claimed ? 'line-through' : ''}`}>
                            {r.text}
                          </p>
                        </div>
                        <button 
                          onClick={() => toggleReward(r.id)} 
                          className="p-3 bg-zinc-800 rounded-xl hover:text-pink-500 transition-colors"
                        >
                          {r.claimed ? <CheckCircle className="text-green-500" /> : <Gift className="text-white" />}
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden"
              >
                <div className="h-96 overflow-y-auto p-6 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-zinc-500 mt-16">No messages yet</div>
                  ) : (
                    <AnimatePresence>
                      {messages.map(msg => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${msg.from === currentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-5 py-3 rounded-2xl ${
                              msg.from === currentUser
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-800 text-white'
                            }`}
                          >
                            <p className="text-xs font-bold mb-1 opacity-70">{users[msg.from]}</p>
                            <p>{msg.text}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
                <div className="border-t border-zinc-800 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Send encouragement..."
                      className="flex-1 px-4 py-3 bg-zinc-800 rounded-2xl text-white placeholder-zinc-500"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button
                      onClick={sendMessage}
                      className="bg-blue-600 px-6 rounded-2xl text-white hover:scale-[1.02] transition-transform"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'progress' && (
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-zinc-900 rounded-3xl p-8 border border-white/5"
                >
                  <h3 className="text-2xl font-black mb-6 text-white">Your Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-800 rounded-2xl p-6 text-center">
                      <p className="text-4xl font-black text-blue-400 mb-2">{userGoals.length}</p>
                      <p className="text-zinc-400 font-bold text-sm">Active Goals</p>
                    </div>
                    <div className="bg-zinc-800 rounded-2xl p-6 text-center">
                      <p className="text-4xl font-black text-pink-400 mb-2">
                        {userTodos.filter(t => t.completed).length}
                      </p>
                      <p className="text-zinc-400 font-bold text-sm">Tasks Done</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-zinc-900 rounded-3xl p-8 border border-white/5"
                >
                  <h3 className="text-2xl font-black mb-6 text-white">{users[otherUser]}'s Journey</h3>
                  {otherUserGoals.length === 0 ? (
                    <p className="text-zinc-500 text-center py-4">No goals yet</p>
                  ) : (
                    <div className="space-y-4">
                      {otherUserGoals.map(goal => (
                        <motion.div
                          key={goal.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25 }}
                          className="border-l-4 border-pink-500 pl-4 py-2"
                        >
                          <h4 className="font-bold text-white mb-2">{goal.text}</h4>
                          <div className="flex justify-between text-sm text-zinc-400 mb-2">
                            <span>{goal.current} / {goal.target}</span>
                            <span className="text-pink-400 font-bold">
                              {Math.round((goal.current / goal.target) * 100)}%
                            </span>
                          </div>
                          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-pink-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                              transition={{ duration: 0.6 }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AccountabilityApp;
