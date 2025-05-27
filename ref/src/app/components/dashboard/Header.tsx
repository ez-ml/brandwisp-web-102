'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import SiteHeader from "../SiteHeader";

export default function Header() {
  const router = useRouter();

  return (
    <SiteHeader/>
  );
}
