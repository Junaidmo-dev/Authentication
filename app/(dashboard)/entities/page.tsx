'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../services/mockApi';
import { Entity } from '../../../types';

export default function EntitiesPage() {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEntityName, setNewEntityName] = useState('');

    useEffect(() => {
        fetchEntities();
    }, []);

    const fetchEntities = async () => {
        const data = await api.getEntities();
        setEntities(data);
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEntityName) return;
        const newEntity = await api.addEntity({
            name: newEntityName,
            status: 'Active',
            assignee: 'You'
        });
        setEntities([newEntity, ...entities]);
        setIsModalOpen(false);
        setNewEntityName('');
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this entity?')) {
            await api.deleteEntity(id);
            setEntities(entities.filter(e => e.id !== id));
        }
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-fade-in-down">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight">Manage Entities</h1>
                    <p className="text-slate-500 dark:text-[#92adc9] text-sm mt-1">View, track and manage your current tasks and notes.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span className="text-sm font-medium">Create New</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col xl:flex-row gap-4 p-4 bg-white dark:bg-[#111a22] rounded-xl border border-slate-200 dark:border-[#324d67]">
                <div className="flex-1">
                    <div className="relative flex w-full">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-[#233648] border-none rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-primary sm:text-sm" placeholder="Search by name, ID or tag..." type="text" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111a22] rounded-xl border border-slate-200 dark:border-[#324d67] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-[#233648]/50 border-b border-slate-200 dark:border-[#233648]">
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#92adc9]">Entity Name</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#92adc9]">Status</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#92adc9]">Last Updated</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#92adc9]">Assignee</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#92adc9] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-[#233648]">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading...</td></tr>
                            ) : entities.map((entity) => (
                                <tr key={entity.id} className="group hover:bg-slate-50 dark:hover:bg-[#233648]/30 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="size-9 rounded bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                                <span className="material-symbols-outlined text-[20px]">description</span>
                                            </div>
                                            <div>
                                                <p className="text-slate-900 dark:text-white text-sm font-medium">{entity.name}</p>
                                                <p className="text-slate-500 dark:text-[#92adc9] text-xs">{entity.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${entity.status === 'Active' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' :
                                                entity.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20' :
                                                    'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                            }`}>
                                            {entity.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="text-slate-900 dark:text-white text-sm">{new Date(entity.lastUpdated).toLocaleDateString()}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-full bg-primary/30 flex items-center justify-center text-primary text-[10px] font-bold">
                                                {entity.assignee.charAt(0)}
                                            </div>
                                            <span className="text-slate-500 dark:text-[#92adc9] text-sm">{entity.assignee}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button onClick={() => handleDelete(entity.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white dark:bg-[#1C252E] rounded-xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Create New Entity</h3>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Entity Name</label>
                                <input
                                    type="text"
                                    value={newEntityName}
                                    onChange={(e) => setNewEntityName(e.target.value)}
                                    className="w-full rounded-lg bg-slate-50 dark:bg-[#111a22] border border-slate-300 dark:border-[#324d67] text-slate-900 dark:text-white px-4 py-2"
                                    placeholder="e.g. Q4 Audit Report"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-blue-600">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
