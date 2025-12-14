import { useState } from 'react';
import { Trophy, TrendingUp, Flame, Star } from 'lucide-react';
import Card, { CardHeader, CardContent, CardTitle } from './Card';
import Avatar from './Avatar';
import Badge from './Badge';

export default function Leaderboard({ employees, onEmployeeClick }) {
    const [filter, setFilter] = useState('score'); // 'score' or 'streak'

    // Sort employees based on filter
    const sortedEmployees = [...(employees || [])].sort((a, b) => {
        const scoreA = a.performance_score || 'C';
        const scoreB = b.performance_score || 'C';
        const completedA = a.tasks_completed || 0;
        const completedB = b.tasks_completed || 0;
        const streakA = a.currentStreak || 0;
        const streakB = b.currentStreak || 0;
        const nameA = a.name || 'Unknown';
        const nameB = b.name || 'Unknown';

        if (filter === 'score') {
            // Sort by completion count DESC, then name
            if (completedB !== completedA) {
                return completedB - completedA;
            }
            return nameA.localeCompare(nameB);
        } else {
            // Sort by streak DESC, then completion count
            if (streakB !== streakA) {
                return streakB - streakA;
            }
            return completedB - completedA;
        }
    });

    const getRankStyle = (index) => {
        switch (index) {
            case 0: return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-700/30';
            case 1: return 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/30';
            case 2: return 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-700/30';
            default: return 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700';
        }
    };

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Trophy className="w-5 h-5 text-yellow-500" />;
            case 1: return <Trophy className="w-5 h-5 text-slate-400" />;
            case 2: return <Trophy className="w-5 h-5 text-orange-400" />;
            default: return <span className="text-gray-400 font-bold w-5 text-center">{index + 1}</span>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                        <Trophy className="w-5 h-5 mr-2 text-primary" />
                        Top Performers
                    </CardTitle>
                    <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button
                            onClick={() => setFilter('score')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'score'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            Most Tasks
                        </button>
                        <button
                            onClick={() => setFilter('streak')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'streak'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            Top Streaks
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {sortedEmployees.slice(0, 5).map((employee, index) => (
                        <div
                            key={employee.id}
                            onClick={() => onEmployeeClick && onEmployeeClick(employee)}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.01] cursor-pointer ${getRankStyle(index)}`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0 flex items-center justify-center w-8">
                                    {getRankIcon(index)}
                                </div>

                                <div className="relative">
                                    <Avatar
                                        src={employee.profilePicture}
                                        name={employee.name}
                                        size="w-10 h-10"
                                        className="ring-2 ring-white dark:ring-gray-800"
                                    />
                                    {index === 0 && (
                                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-0.5 rounded-full ring-2 ring-white dark:ring-gray-800">
                                            <Star className="w-3 h-3 fill-current" />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center">
                                        <p className="font-semibold text-gray-900 dark:text-white mr-2">
                                            {employee.name}
                                        </p>
                                        {employee.streakActive && employee.currentStreak >= 3 && (
                                            <span className="flex items-center text-[10px] font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                                                <Flame className="w-3 h-3 mr-0.5 fill-current" />
                                                {employee.currentStreak}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {employee.tasks_completed} completed tasks
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <Badge variant={
                                    employee.performance_score === 'A+' ? 'success' :
                                        employee.performance_score === 'A' ? 'primary' :
                                            employee.performance_score === 'B' ? 'warning' : 'secondary'
                                }>
                                    Grade: {employee.performance_score}
                                </Badge>
                                {/* Visual score bar */}
                                <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full"
                                        style={{
                                            width: `${Math.min((employee.tasks_completed / (sortedEmployees[0].tasks_completed || 1)) * 100, 100)}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {sortedEmployees.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No performance data yet</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
