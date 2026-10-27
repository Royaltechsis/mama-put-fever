import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { GameBtn, GText, Panel, SW, SH, useS } from './stage';
import { accountsAvailable, getSave, login, logout, progressScore, putSave, signup, type User } from './account';
import { migrate, type Save2 } from './save2';

export default function AccountPanel({ save, user, onClose, onUser, onLoadSave }: { save: Save2; user: User | null; onClose: () => void; onUser: (u: User | null) => void; onLoadSave: (s: Save2) => void }) {
  const S = useS();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<{ t: string; bad?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const avail = accountsAvailable();
  const input = { backgroundColor: '#FFF', borderRadius: S(8), borderWidth: S(2), borderColor: '#C9934F', paddingHorizontal: S(10), height: S(36), fontSize: S(14), color: '#3A2416', width: S(300), marginTop: S(8) } as const;

  async function afterLogin(u: User) {
    onUser(u);
    const r = await getSave();
    if (r.ok && r.save && progressScore(migrate(r.save)) > progressScore(save)) { onLoadSave(migrate(r.save)); setMsg({ t: `Welcome back, ${u.username}! Loaded your saved progress.` }); }
    else { await putSave(save); setMsg({ t: `Done, ${u.username}! Your progress is saved to your account.` }); }
  }
  async function submit() {
    setBusy(true); setMsg(null);
    const r = mode === 'signup' ? await signup(username.trim(), email.trim(), password) : await login(email.trim() || username.trim(), password);
    setBusy(false);
    if (!r.ok || !r.user) { setMsg({ t: r.error || 'Something went wrong', bad: true }); return; }
    setPassword('');
    await afterLogin(r.user);
  }
  return (
    <View style={{ position: 'absolute', left: 0, top: 0, width: S(SW), height: S(SH), backgroundColor: '#000A', alignItems: 'center', justifyContent: 'center' }}>
      <Panel w={420} h={330}>
        <View style={{ flex: 1, alignItems: 'center', padding: S(12) }}>
          <GText size={22} color="#B5560F">{user ? `👤 ${user.username}` : mode === 'signup' ? 'Save your progress' : 'Log in'}</GText>
          {!avail ? (
            <>
              <GText size={14} color="#4A2C14" style={{ marginTop: S(14), textAlign: 'center' }}>Accounts live on the main Mamaput site.</GText>
              <GText size={13} color="#6B4A2A" style={{ marginTop: S(8), textAlign: 'center' }}>On this link your progress is saved on this device, so you won't lose it.</GText>
            </>
          ) : user ? (
            <>
              <GText size={13} color="#4A2C14" style={{ marginTop: S(10), textAlign: 'center' }}>{`Signed in as ${user.email}. Your progress saves to your account at the end of every day.`}</GText>
              <GameBtn label="Save now" w={200} h={40} size={15} testID="acct-savenow" style={{ marginTop: S(14) }} onPress={async () => { const r = await putSave(save); setMsg(r.ok ? { t: 'Saved ✓' } : { t: r.error || 'Could not save', bad: true }); }} />
              <GameBtn label="Log out" color="red" w={200} h={40} size={15} testID="acct-logout" style={{ marginTop: S(8) }} onPress={async () => { await logout(); onUser(null); setMsg({ t: 'Logged out. Progress stays on this device.' }); }} />
            </>
          ) : (
            <>
              <GText size={11} color="#6B4A2A" style={{ marginTop: S(2), textAlign: 'center' }}>Optional, any time. It just keeps your progress safe across devices.</GText>
              {mode === 'signup' && <TextInput testID="acct-username" placeholder="Username" autoCapitalize="none" value={username} onChangeText={setUsername} style={input} />}
              <TextInput testID="acct-email" placeholder={mode === 'signup' ? 'Email' : 'Email or username'} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={input} />
              <TextInput testID="acct-password" placeholder="Password (6+ characters)" secureTextEntry value={password} onChangeText={setPassword} onSubmitEditing={submit} style={input} />
              <GameBtn label={busy ? '...' : mode === 'signup' ? 'Create account' : 'Log in'} disabled={busy} w={220} h={40} size={16} testID="acct-submit" style={{ marginTop: S(10) }} onPress={submit} />
              <Text testID="acct-switch" onPress={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setMsg(null); }} style={{ color: '#8A4B12', fontSize: S(12), marginTop: S(6), textDecorationLine: 'underline' }}>{mode === 'signup' ? 'Already have an account? Log in' : 'New here? Create an account'}</Text>
            </>
          )}
          {msg && <GText size={12} color={msg.bad ? '#B3261E' : '#2E7D32'} style={{ marginTop: S(6), textAlign: 'center' }}>{msg.t}</GText>}
          <View style={{ flex: 1 }} />
          <GameBtn label="Close" color="grey" w={120} h={34} size={13} testID="acct-close" onPress={onClose} />
        </View>
      </Panel>
    </View>
  );
}
