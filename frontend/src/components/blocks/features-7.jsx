import React from 'react'
import { Cpu, Lock, Sparkles, Zap } from 'lucide-react'

export function Features() {
    return (
        <section className="overflow-hidden py-16 md:py-24 border-t border-outline-variant mt-16 bg-surface-container-lowest rounded-3xl">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-4xl font-extrabold lg:text-5xl tracking-tight text-on-surface">Built for Scaling teams</h2>
                    <p className="mt-4 text-base md:text-lg text-on-surface-variant font-medium">Empower your team with workflows that adapt to your needs, whether you prefer Git synchronization or an AI Agents interface.</p>
                </div>
                <div className="relative -mx-4 rounded-3xl p-3 md:-mx-12 lg:col-span-3">
                    <div className="[perspective:800px]">
                        <div className="[transform:skewY(-1deg)skewX(-1deg)rotateX(3deg)]">
                            <div className="aspect-[88/36] relative rounded-2xl overflow-hidden border border-outline-variant shadow-lg bg-surface-container-low">
                                <div className="[background-image:radial-gradient(var(--tw-gradient-stops,at_75%_25%))] to-background z-1 -inset-[4.25rem] absolute from-transparent to-75%"></div>
                                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" className="absolute inset-0 z-10 w-full h-full object-cover" alt="payments illustration dark" />
                                <img src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80" className="hidden dark:block w-full h-full object-cover" alt="payments illustration dark" />
                                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80" className="dark:hidden w-full h-full object-cover" alt="payments illustration light" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
                    <div className="space-y-2 p-4 bg-surface rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-2 text-primary">
                            <Zap className="size-4" />
                            <h3 className="text-sm font-bold text-on-surface">Faaast</h3>
                        </div>
                        <p className="text-on-surface-variant text-xs font-semibold">It supports an entire ecosystem helping developers innovate.</p>
                    </div>
                    <div className="space-y-2 p-4 bg-surface rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-2 text-primary">
                            <Cpu className="size-4" />
                            <h3 className="text-sm font-bold text-on-surface">Powerful</h3>
                        </div>
                        <p className="text-on-surface-variant text-xs font-semibold">It supports an entire infrastructure helping developers and businesses scale.</p>
                    </div>
                    <div className="space-y-2 p-4 bg-surface rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-2 text-primary">
                            <Lock className="size-4" />
                            <h3 className="text-sm font-bold text-on-surface">Security</h3>
                        </div>
                        <p className="text-on-surface-variant text-xs font-semibold">It supports enterprise-grade encryption helping developers secure data.</p>
                    </div>
                    <div className="space-y-2 p-4 bg-surface rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-2 text-primary">
                            <Sparkles className="size-4" />
                            <h3 className="text-sm font-bold text-on-surface">AI Powered</h3>
                        </div>
                        <p className="text-on-surface-variant text-xs font-semibold">It supports generative automation helping teams build at warp speed.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
