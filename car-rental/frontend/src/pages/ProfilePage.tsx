import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { authAPI, verificationsAPI } from '../lib/api';
import { User, Mail, Phone, Shield, Save, Eye, EyeOff, Copy, Check, Upload, UserCheck, AlertCircle, Gift } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { customToast } from '../components/CustomToast';
import type { Verification } from '../types';

interface ReferralInfo {
  referralCode: string;
  referralCount: number;
  referralDiscountPercent: number;
  referrals: Array<{ referredUserId: string; createdAt: string }>;
}

export default function ProfilePage() {
  const { user, loadUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [emergencyContact, setEmergencyContact] = useState({ name: '', phone: '', relation: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [verLoading, setVerLoading] = useState(false);
  const [verDocType, setVerDocType] = useState<'identity' | 'driving_licence' | 'insurance'>('identity');
  const [verFiles, setVerFiles] = useState<FileList | null>(null);
  const [verSubmitting, setVerSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: (user as any).phone || '', address: (user as any).address || '' });
      const ec = (user as any).emergencyContact;
      if (ec) setEmergencyContact({ name: ec.name || '', phone: ec.phone || '', relation: ec.relation || '' });
    }
  }, [user]);

  useEffect(() => {
    loadReferral();
    loadVerifications();
  }, []);

  const loadReferral = async () => {
    setReferralLoading(true);
    try {
      const res = await authAPI.referral();
      setReferral(res.data);
    } catch { /* silent */ } finally { setReferralLoading(false); }
  };

  const loadVerifications = async () => {
    setVerLoading(true);
    try {
      const res = await verificationsAPI.myVerifications();
      setVerifications(res.data?.verifications || []);
    } catch { /* silent */ } finally { setVerLoading(false); }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateProfile({ ...form, emergencyContact });
      await loadUser();
      customToast.success('Profile updated');
    } catch (err: any) {
      customToast.error(err?.response?.data?.detail || 'Update failed');
    } finally { setLoading(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { customToast.error('Passwords do not match'); return; }
    if (passwordForm.newPassword.length < 6) { customToast.error('Password must be at least 6 characters'); return; }
    setPasswordLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      customToast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      customToast.error(err?.response?.data?.detail || 'Password change failed');
    } finally { setPasswordLoading(false); }
  };

  const copyReferralCode = () => {
    if (!referral?.referralCode) return;
    navigator.clipboard.writeText(referral.referralCode);
    setCopied(true);
    customToast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerificationSubmit = async () => {
    if (!verFiles || verFiles.length === 0) { customToast.error('Please select files to upload'); return; }
    setVerSubmitting(true);
    try {
      const submitRes = await verificationsAPI.submit({ type: verDocType });
      const verificationId = submitRes.data._id || submitRes.data.id;
      await verificationsAPI.uploadDocs(verificationId, Array.from(verFiles));
      customToast.success('Verification documents submitted! Admin will review within 24h.');
      setVerFiles(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadVerifications();
    } catch (err: any) {
      customToast.error(err?.response?.data?.detail || 'Upload failed');
    } finally { setVerSubmitting(false); }
  };

  const getVerStatusColor = (status: string) => {
    if (status === 'approved') return 'text-green-400 bg-green-500/10';
    if (status === 'rejected') return 'text-red-400 bg-red-500/10';
    return 'text-yellow-400 bg-yellow-500/10';
  };

  const getVerIcon = (status: string) => {
    if (status === 'approved') return <Check className="w-3.5 h-3.5" />;
    if (status === 'rejected') return <AlertCircle className="w-3.5 h-3.5" />;
    return <Shield className="w-3.5 h-3.5" />;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <ScrollReveal>
        <h1 className="text-3xl font-display font-bold text-white mb-2">My Profile</h1>
      </ScrollReveal>

      {/* Profile Info */}
      <ScrollReveal delay={100}>
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-neon-purple flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-dark-400 text-sm flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </p>
            <span className="badge-blue mt-1 inline-block text-xs">{user?.role}</span>
            {(user as any)?.isVerified && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                <UserCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="Your full name" />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} className="input-field" placeholder="+91 9876543210" />
          </div>
          <div>
            <label className="label">Address</label>
            <textarea value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))} className="input-field min-h-[70px]" placeholder="Your address" />
          </div>

          {/* Emergency Contact */}
          <div className="border-t border-white/[0.06] pt-4">
            <h3 className="text-sm font-semibold text-dark-500 mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary-500" /> Emergency Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input value={emergencyContact.name} onChange={e => setEmergencyContact(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="Contact name" />
              <input value={emergencyContact.phone} onChange={e => setEmergencyContact(p => ({ ...p, phone: e.target.value }))} className="input-field" placeholder="Phone number" />
              <input value={emergencyContact.relation} onChange={e => setEmergencyContact(p => ({ ...p, relation: e.target.value }))} className="input-field" placeholder="Relation (e.g. Spouse)" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
      </ScrollReveal>

      {/* Referral Program */}
      <ScrollReveal delay={200}>
      <div className="card p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary-500" /> Referral Program
        </h3>
        {referralLoading ? (
          <div className="h-20 bg-dark-800 animate-pulse rounded-xl" />
        ) : referral ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-dark-800 rounded-xl px-4 py-3 font-mono text-lg text-primary-400 tracking-widest">
                {referral.referralCode}
              </div>
              <button onClick={copyReferralCode} className="btn-secondary flex items-center gap-2 text-sm">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-dark-800 rounded-xl p-3">
                <p className="text-2xl font-bold text-dark-100">{referral.referralCount}</p>
                <p className="text-xs text-dark-400 mt-1">Total Referrals</p>
              </div>
              <div className="bg-dark-800 rounded-xl p-3">
                <p className="text-2xl font-bold text-primary-400">{referral.referralDiscountPercent}%</p>
                <p className="text-xs text-dark-400 mt-1">Discount Earned</p>
              </div>
              <div className="bg-dark-800 rounded-xl p-3">
                <p className="text-2xl font-bold text-green-400">{(referral.referrals || []).length}</p>
                <p className="text-xs text-dark-400 mt-1">Active Refs</p>
              </div>
            </div>
            <p className="text-xs text-dark-400">Share your referral code. Both you and the new user get a discount on their first booking!</p>
          </div>
        ) : (
          <p className="text-sm text-dark-400">Referral information unavailable.</p>
        )}
      </div>
      </ScrollReveal>

      {/* Identity Verification */}
      <ScrollReveal delay={300}>
      <div className="card p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary-500" /> Identity Verification
        </h3>

        {/* Existing verifications */}
        {verLoading ? (
          <div className="h-16 bg-dark-800 animate-pulse rounded-xl mb-4" />
        ) : verifications.length > 0 ? (
          <div className="space-y-2 mb-5">
            {verifications.map(v => (
              <div key={v._id} className="flex items-center justify-between p-3 bg-dark-800 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-dark-200 capitalize">{v.type.replace('_', ' ')}</p>
                  <p className="text-xs text-dark-400">{v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium ${getVerStatusColor(v.status)}`}>
                  {getVerIcon(v.status)} {v.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-dark-400 mb-5">No verifications submitted yet.</p>
        )}

        {/* Submit new verification */}
        <div className="border-t border-dark-700 pt-5 space-y-4">
          <h4 className="text-sm font-medium text-dark-300">Submit New Document</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Document Type</label>
              <select value={verDocType} onChange={e => setVerDocType(e.target.value as any)} className="input-field" title="Document Type">
                <option value="identity">Identity (Aadhaar / Passport)</option>
                <option value="driving_licence">Driving Licence</option>
                <option value="insurance">Insurance Document</option>
              </select>
            </div>
            <div>
              <label className="label">Upload Document(s)</label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={e => setVerFiles(e.target.files)}
                className="hidden"
                id="ver-upload"
              />
              <label htmlFor="ver-upload" className="input-field flex items-center gap-2 cursor-pointer text-dark-400 hover:text-dark-200">
                <Upload className="w-4 h-4" />
                {verFiles && verFiles.length > 0 ? `${verFiles.length} file(s) selected` : 'Choose files'}
              </label>
            </div>
          </div>
          <button onClick={handleVerificationSubmit} disabled={verSubmitting || !verFiles} className="btn-primary flex items-center gap-2">
            <Upload className="w-4 h-4" /> {verSubmitting ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </div>
      </div>
      </ScrollReveal>

      {/* Change Password */}
      <ScrollReveal delay={400}>
      <div className="card p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-500" /> Change Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type={showPasswords ? 'text' : 'password'} value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} className="input-field" required placeholder="Enter current password" title="Current Password" />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type={showPasswords ? 'text' : 'password'} value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} className="input-field" required minLength={6} placeholder="Enter new password" title="New Password" />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type={showPasswords ? 'text' : 'password'} value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} className="input-field" required placeholder="Confirm new password" title="Confirm New Password" />
          </div>
          <label className="flex items-center gap-2 text-sm text-dark-400 cursor-pointer">
            <input type="checkbox" checked={showPasswords} onChange={e => setShowPasswords(e.target.checked)} className="rounded" />
            Show passwords
          </label>
          <button type="submit" disabled={passwordLoading} className="btn-secondary">
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
      </ScrollReveal>
    </div>
  );
}
