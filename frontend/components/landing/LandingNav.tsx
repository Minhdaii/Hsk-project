'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUser } from '@/lib/useUser';
import styles from './LandingNav.module.css';

const LINKS = [
  { href: '#tone-experience', label: 'Thanh điệu' },
  { href: '#stroke-experience', label: 'Nét chữ' },
  { href: '#learning-tools', label: 'Công cụ học' },
];

export default function LandingNav() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Điều hướng chính">
        <Link href="/" className={styles.brand} aria-label="Học Hán ngữ, trang chủ" onClick={() => setOpen(false)}>
          <span className={styles.logo} lang="zh-Hans">汉</span>
          <span className={styles.brandText}>学汉语<small>HSK · LEARNING LAB</small></span>
        </Link>
        <div className={styles.links}>
          {LINKS.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}
        </div>
        <div className={styles.actions}>
          {!user && <Link className={styles.login} href="/login">Đăng nhập</Link>}
          <Link className={styles.cta} href="/dashboard">{user ? 'Vào học' : 'Bắt đầu học'} <span aria-hidden="true">↗</span></Link>
        </div>
        <button className={styles.menuButton} type="button" aria-label={open ? 'Đóng menu' : 'Mở menu'} aria-expanded={open} aria-controls="landing-mobile-menu" onClick={() => setOpen(value => !value)}>
          <span/><span/>
        </button>
      </nav>
      <div id="landing-mobile-menu" className={`${styles.mobileMenu} ${open ? styles.mobileMenuOpen : ''}`} inert={!open}>
        {LINKS.map(link => <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}<span aria-hidden="true">↘</span></a>)}
        {!user && <Link href="/login" onClick={() => setOpen(false)}>Đăng nhập</Link>}
        <Link className={styles.mobileCta} href="/dashboard" onClick={() => setOpen(false)}>Vào học <span aria-hidden="true">↗</span></Link>
      </div>
    </header>
  );
}
