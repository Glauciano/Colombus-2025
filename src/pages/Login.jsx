import React from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

export default function Login({ onLogin }) {
  const [mode, setMode] = React.useState('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!supabase) {
      setError('Supabase não configurado');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        if (data.user) onLogin(data.user);
      } else {
        const { data, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        if (data.user && !data.session) {
          setSuccess('Conta criada! Verifique seu email para confirmar, depois faça login.');
          setMode('login');
        } else if (data.session) {
          onLogin(data.user);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      const msg = err.message || '';
      if (msg.includes('Invalid login')) {
        setError('Email ou senha incorretos');
      } else if (msg.includes('already registered')) {
        setError('Este email já está cadastrado. Faça login.');
        setMode('login');
      } else if (msg.includes('Password should be')) {
        setError('A senha deve ter pelo menos 6 caracteres');
      } else {
        setError(msg || 'Erro ao fazer login');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-sidebar-primary flex items-center justify-center mb-4">
            <span className="text-sidebar-primary-foreground font-bold text-2xl" style={{ fontFamily: '"Playfair Display", serif' }}>C</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>Colombus 2025</h1>
          <p className="text-muted-foreground mt-1">Pombos-Correio</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-center">{mode === 'login' ? 'Entrar' : 'Criar Conta'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-9" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-9 pr-9" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
              {success && <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">{success}</div>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {mode === 'login' ? (
                  <>Não tem conta? <button type="button" className="text-primary hover:underline font-medium" onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}>Criar conta</button></>
                ) : (
                  <>Já tem conta? <button type="button" className="text-primary hover:underline font-medium" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>Fazer login</button></>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">Colombus 2025 — Clube de Pombos-Correio</p>
      </div>
    </div>
  );
}
