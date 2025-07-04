import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, Users, Clock, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import PollQuestionsPage from './PollQuestionsPage';

const JoinPollPage: React.FC = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [error, setError] = useState('');
  const [joinStatus, setJoinStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Format room code as user types (ABC-123 format)
  const formatRoomCode = (value: string) => {
    const cleaned = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 3) return cleaned;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}`;
  };

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRoomCode(e.target.value);
    setRoomCode(formatted);
    setError('');
    setRoomInfo(null);
    setJoinStatus('idle');

    // Validate room code when complete
    if (formatted.length === 7) {
      validateRoomCode(formatted);
    }
  };

  const validateRoomCode = async (code: string) => {
    setIsValidating(true);
    setError('');

    try {
      // Simulate API call to validate room code
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock room validation logic
      const mockRooms = {
        'ABC-123': {
          title: 'Mathematics Quiz - Chapter 5',
          host: 'Dr. Smith',
          participants: 24,
          timeRemaining: '45 minutes',
          status: 'active'
        },
        'XYZ-789': {
          title: 'History Discussion',
          host: 'Prof. Johnson',
          participants: 18,
          timeRemaining: '12 minutes',
          status: 'active'
        },
        'DEF-456': {
          title: 'Science Lab Poll',
          host: 'Dr. Brown',
          participants: 0,
          timeRemaining: 'Expired',
          status: 'expired'
        }
      };

      const room = mockRooms[code as keyof typeof mockRooms];
      
      if (room) {
        if (room.status === 'expired') {
          setError('This room has expired. Please contact your instructor for a new room code.');
        } else {
          setRoomInfo(room);
        }
      } else {
        setError('Invalid room code. Please check and try again.');
      }
    } catch (err) {
      setError('Failed to validate room code. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleJoinPoll = async () => {
    if (!roomInfo) return;

    setIsJoining(true);
    try {
      // Simulate joining the poll
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setJoinStatus('success');
      
      // Redirect to poll questions page after showing success message
      setTimeout(() => {
        navigate('/student/poll-questions', { 
          state: { 
            roomCode, 
            roomInfo,
            pollTitle: roomInfo.title 
          } 
        });
      }, 1500);
      
    } catch (err) {
      setJoinStatus('error');
      setError('Failed to join the poll. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && roomInfo && !isJoining) {
      handleJoinPoll();
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full mx-auto p-4 sm:p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <Hash className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Join Poll Session</h1>
          <p className="text-gray-300">Enter your room code to join the live poll</p>
        </div>

 {/* Instructions */}
  <div className="mb-8">
    <div className="bg-gradient-to-r from-purple-700/40 to-blue-700/40 border border-purple-500/30 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4 shadow-lg">
      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
        <CheckCircle className="w-7 h-7 text-white" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">How to Join a Poll</h2>
        <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
          <li>Ask your instructor for the <span className="text-primary-400 font-semibold">Room Code</span>.</li>
          <li>Type the code in the box below (e.g., <span className="font-mono text-blue-300">ABC-123</span>).</li>
          <li>Wait for the poll details to appear, then click <span className="text-primary-400 font-semibold">Join Poll</span>.</li>
          <li>If the code is invalid or expired, you’ll see a helpful message.</li>
        </ul>
      </div>
    </div>
  </div>
  
        {/* Main Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
          {joinStatus === "success" ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-green-500 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-white mb-2">Successfully Joined!</h3>
              <p className="text-gray-400 mb-4">Redirecting to poll questions...</p>
              <Loader2 className="w-5 h-5 animate-spin text-blue-400 mx-auto" />
            </div>
          ) : (
            <>
              {/* Room Code Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">
                  Room Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={handleRoomCodeChange}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g. ABC-123"
                    className="w-full px-4 py-3 pl-12 bg-white/5 text-white border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500/50 text-lg font-mono tracking-wider placeholder-gray-400"
                    maxLength={7}
                  />
                  <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  {isValidating && (
                    <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-blue-400" />
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 flex items-center space-x-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Room Info Preview */}
              {roomInfo && (
                <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl text-white space-y-2">
                  <p><strong>Poll:</strong> {roomInfo.title}</p>
                  <p><strong>Host:</strong> {roomInfo.host}</p>
                  <p><strong>Participants:</strong> {roomInfo.participants}</p>
                  <p><strong>Time Remaining:</strong> {roomInfo.timeRemaining}</p>
                </div>
              )}

              {/* Join Button */}
              <button
                onClick={handleJoinPoll}
                disabled={!roomInfo || isJoining}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-200 text-white ${
                  roomInfo && !isJoining
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-110"
                    : "bg-white/10 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isJoining ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Joining...
                  </div>
                ) : (
                  "Join Poll"
                )}
              </button>
            </>
          )}
        </div>

        {/* Footer Tips */}
        {joinStatus !== "success" && (
          <div className="mt-6 text-sm text-gray-400 text-center">
            Room codes are 6 characters long (e.g., ABC-123). Ask your instructor for the code.
          </div>
        )}
      </motion.div>
    </>
  );
}

export default JoinPollPage
