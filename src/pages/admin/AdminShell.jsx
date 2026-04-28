/**
 * AdminShell — admin panel layout.
 *
 * Dark-by-default using paper.jsx tokens. Persistent sidebar, top header,
 * Outlet for nested admin routes. Responsive collapse at 768px.
 */

import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ACFonts, ACBrand, useACT } from '@/redesign/v3/lib/paper.jsx';
import { HeartMark } from '@/redesign/v3/lib/brandMarks.jsx';

const NAV = [
  { group: 'Core', items: [
    { label: 'Dashboard', path: '/admin', icon: '◈' },
    { label: 'Users', path: '/admin/users', icon: '◉' },
    { label: 'Billing', path: '/admin/billing', icon: '◎' },
  ]},
  { group: 'Operations', items: [
    { label: 'Moderation', path: '/admin/moderation', icon: '◇' },
    { label: 'Support', path: '/admin/support', icon: '◆' },
    { label: 'Invites', path: '/admin/invites', icon: '◐' },
  ]},
  { group: 'System', items: [
    { label: 'Ops Health', path: '/admin/ops', icon: '◑' },
    { label: 'Audit Log', path: '/admin/audit', icon: '◒' },
    { label: 'Compliance', path: '/admin/compliance', icon: '◓' },
    { label: 'Settings', path: '/admin/settings', icon: '◔' },
  ]},
];

function SidebarLink({ item, active, collapsed }) {
  return (
    <Link
      to={item.path}
      style={{
        display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 12,
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '10px 0' : '10px 16px',
        borderRadius: 10,
        background: active ? 'rgba(232,181,0,0.12)' : 'transparent',
        color: active ? ACBrand.accent : 'rgba(239,233,218,0.55)',
        textDecoration: 'none',
        fontSize: 13, fontWeight: active ? 600 : 500,
        fontFamily: ACFonts.body,
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: 14, width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export default function AdminShell() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const c = useACT(true); // always dark

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: c.bg, color: c.fg,
      fontFamily: ACFonts.body,
    }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarWidth, flexShrink: 0,
        borderRight: `1px solid ${c.hair}`,
        display: 'flex', flexDirection: 'column',
        padding: collapsed ? '16px 8px' : '16px',
        transition: 'width 0.2s',
        overflow: 'hidden',
      }}>
        {/* Brand */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 4px 20px', cursor: 'pointer',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }} onClick={() => setCollapsed(!collapsed)}>
          <HeartMark size={20} color={c.accent} accent={c.accent} />
          {!collapsed && (
            <span style={{
              fontFamily: ACFonts.brand, fontSize: 15, letterSpacing: -0.4,
              color: c.fg, textTransform: 'lowercase',
            }}>
              atlas<span style={{ color: c.accent }}>.</span>core
            </span>
          )}
          {!collapsed && (
            <span style={{
              marginLeft: 'auto', fontFamily: ACFonts.mono,
              fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase',
              color: c.mute, background: 'rgba(232,181,0,0.15)',
              padding: '2px 6px', borderRadius: 4,
            }}>admin</span>
          )}
        </div>

        {/* Nav groups */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {NAV.map((group) => (
            <div key={group.group}>
              {!collapsed && (
                <div style={{
                  fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 2,
                  textTransform: 'uppercase', color: c.mute,
                  padding: '0 16px 6px',
                }}>
                  {group.group}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {group.items.map((item) => (
                  <SidebarLink
                    key={item.path}
                    item={item}
                    active={location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path + '/'))}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User info */}
        <div style={{
          borderTop: `1px solid ${c.hair}`, paddingTop: 12, marginTop: 12,
          display: 'flex', alignItems: 'center', gap: 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 999,
            background: c.accent, color: c.ink,
            display: 'grid', placeItems: 'center',
            fontSize: 12, fontWeight: 700,
          }}>
            {(user?.full_name || user?.email || 'A')[0].toUpperCase()}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: c.fg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.full_name || user?.email || 'Admin'}
              </div>
              <div style={{ fontSize: 10, color: c.mute }}>{user?.atlas_role || 'admin'}</div>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={() => { logout(); navigate('/auth/login'); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: c.mute, fontSize: 11, padding: 4,
              }}
              title="Sign out"
            >
              ×
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <header style={{
          padding: '12px 24px',
          borderBottom: `1px solid ${c.hair}`,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 10,
            background: 'rgba(239,233,218,0.04)',
            border: `1px solid ${c.hair}`,
          }}>
            <span style={{ fontSize: 13, color: c.mute }}>⌘K</span>
            <span style={{ fontSize: 13, color: c.mute }}>Search users, actions...</span>
          </div>
          <div style={{
            width: 8, height: 8, borderRadius: 999,
            background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.4)',
          }} title="System healthy" />
          <button
            type="button"
            onClick={() => navigate('/app/today')}
            style={{
              background: 'none', border: `1px solid ${c.hair}`,
              borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
              fontFamily: ACFonts.mono, fontSize: 10, letterSpacing: 1,
              textTransform: 'uppercase', color: c.dim,
            }}
          >
            Back to app
          </button>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          <Outlet />
        </div>

        {/* Status strip */}
        <div style={{
          padding: '6px 24px',
          borderTop: `1px solid ${c.hair}`,
          display: 'flex', gap: 16,
          fontFamily: ACFonts.mono, fontSize: 9, letterSpacing: 1,
          textTransform: 'uppercase', color: c.mute,
        }}>
          <span>atlas.core admin</span>
          <span>·</span>
          <span style={{ color: '#22c55e' }}>● online</span>
          <span style={{ marginLeft: 'auto' }}>v1.0 build 21</span>
        </div>
      </main>
    </div>
  );
}
