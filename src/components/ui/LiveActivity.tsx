"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle, GraduationCap, Zap, Star, Flame } from 'lucide-react';

// Generates realistic Senegalese student names
const firstNames = ["Fatou", "Moussa", "Aida", "Cheikh", "Aminata", "Babacar", "Oumou", "Ibrahima", "Seynabou", "Abdoulaye", "Khadija", "Modou"];
const lastNames = ["Diop", "Ndiaye", "Sow", "Fall", "Gueye", "Ba", "Sy", "Cisse", "Diallo", "Faye"];

const subjects = ["Maths", "SVT", "Physique", "Français", "Anglais", "Philo", "HG"];

const actions = [
    { type: 'quiz', text: 'a réussi le Quiz', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-100' },
    { type: 'download', text: 'a téléchargé Sujet', icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
    { type: 'premium', text: 'est devenu Premium', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-100' },
    { type: 'level', text: 'est passé Niveau', icon: Star, color: 'text-green-500', bg: 'bg-green-100' },
    { type: 'streak', text: 'est en feu 🔥', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-100' },
];

interface Activity {
    id: number;
    user: string;
    action: string;
    detail: string;
    icon: any;
    color: string;
    bg: string;
}

export default function LiveActivity() {
    // Initial content to avoid hydration mismatch (rendered on server)
    const [activity, setActivity] = useState<Activity | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Start showing activity after a small delay
        const initialTimer = setTimeout(() => setIsVisible(true), 2000);

        const generateActivity = () => {
            const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const actionType = actions[Math.floor(Math.random() * actions.length)];

            let detail = "";
            if (actionType.type === 'quiz') {
                const subject = subjects[Math.floor(Math.random() * subjects.length)];
                const score = Math.floor(Math.random() * 5) + 15; // Score between 15 and 20
                detail = `${subject} (${score}/20)`;
            } else if (actionType.type === 'download') {
                const subject = subjects[Math.floor(Math.random() * subjects.length)];
                const year = Math.floor(Math.random() * 5) + 2020;
                detail = `${subject} ${year}`;
            } else if (actionType.type === 'level') {
                const level = Math.floor(Math.random() * 10) + 2;
                detail = `${level}`;
            } else if (actionType.type === 'streak') {
                const days = Math.floor(Math.random() * 10) + 3;
                detail = `${days} jours`;
            }

            setActivity({
                id: Date.now(),
                user: `${randomFirstName} ${randomLastName.charAt(0)}.`,
                action: actionType.text,
                detail,
                icon: actionType.icon,
                color: actionType.color,
                bg: actionType.bg
            });
        };

        generateActivity(); // First one

        const interval = setInterval(() => {
            // Random interval between 3s and 8s for realism
            if (Math.random() > 0.3) {
                generateActivity();
            }
        }, 5000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    if (!isVisible || !activity) return null;

    return (
        <div className="fixed bottom-24 left-6 z-40 hidden lg:block perspective">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 50, rotateX: -20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: -50, rotateX: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-center gap-4 p-4 pr-6 bg-white/80 backdrop-blur-xl border border-white/40 rounded-[1.5rem] shadow-2xl shadow-indigo-500/10 max-w-sm hover:scale-105 transition-transform cursor-default"
                >
                    <div className={`h-10 w-10 rounded-full ${activity.bg} ${activity.color} flex items-center justify-center shadow-sm`}>
                        <activity.icon className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                        <p className="font-bold text-sm text-slate-800">
                            {activity.user}
                        </p>
                        <p className="text-xs font-bold text-slate-500">
                            {activity.action} <span className={activity.color}>{activity.detail}</span>
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
