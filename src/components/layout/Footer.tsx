import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Github, Twitter, Linkedin, Mail, ArrowUpRight, GraduationCap, ShieldCheck } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-slate-400 border-t border-white/5 pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white overflow-hidden p-0.5 shadow-lg group-hover:scale-105 transition-transform">
                                <Image
                                    src="/logo.png"
                                    alt="Jàngatub Logo"
                                    width={40}
                                    height={40}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <span className="font-black text-2xl tracking-tighter text-white">
                                Jànga<span className="text-[#4F46E5]">tub</span>
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-500">
                            La plateforme éducative de référence au Sénégal. Préparez vos examens nationaux avec les meilleurs outils numériques.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                                <a key={i} href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all border border-white/5">
                                    <Icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-6">
                        <h4 className="text-white font-bold uppercase tracking-widest text-xs">Navigation</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            {[
                                { label: "Bibliothèque", href: "/docs" },
                                { label: "Offres Premium", href: "/pricing" },
                                { label: "Aide & FAQ", href: "/support" },
                                { label: "Favoris", href: "/favorites" },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="hover:text-primary flex items-center gap-2 group transition-colors">
                                        {link.label}
                                        <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="space-y-6">
                        <h4 className="text-white font-bold uppercase tracking-widest text-xs">Examens</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            {[
                                { label: "BFEM Sénégal", icon: GraduationCap, href: "/bfem" },
                                { label: "BAC Sénégal", icon: ShieldCheck, href: "/bac" },
                                { label: "Sujets & Corrigés", icon: BookOpen, href: "/docs" },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="hover:text-primary flex items-center gap-2 group transition-colors">
                                        <link.icon className="h-4 w-4 text-slate-600" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter / Contact */}
                    <div className="glass-card bg-white/5 border-white/10 p-6 rounded-3xl space-y-6">
                        <h4 className="text-white font-bold">Contact Rapide</h4>
                        <p className="text-xs text-slate-500">Une question ? Envoyez-nous un message directement.</p>
                        <a
                            href="mailto:contact@jangatub.sn"
                            className="flex items-center justify-center p-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-primary hover:text-white transition-all text-sm"
                        >
                            Email Support
                        </a>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold uppercase tracking-widest text-slate-600">
                    <p>© 2026 Jàngatub Platform. Tous droits réservés.</p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
                        <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
