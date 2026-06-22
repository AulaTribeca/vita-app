import {
  Bell, CalendarDays, Car, CheckCircle2, ClipboardCheck, CreditCard,
  Droplet, FileText, Folder, Heart, Home, House, Lightbulb,
  Menu, Moon, Pill, Plus, Search, Settings, ShieldCheck,
  ShoppingCart, ShowerHead, Smile, UploadCloud, UserRound, UsersRound,
  WalletCards, Zap, PencilLine, GraduationCap, BookOpen, Hammer,
  FileArchive, FileDown, Fuel, Stethoscope, LockKeyhole, NotebookText
} from 'lucide-react'

const icons = {
  Bell, CalendarDays, Car, CheckCircle2, ClipboardCheck, CreditCard,
  Droplet, FileText, Folder, Heart, Home, House, Lightbulb,
  Menu, Moon, Pill, Plus, Search, Settings, ShieldCheck,
  ShoppingCart, ShowerHead, Smile, UploadCloud, UserRound, UsersRound,
  WalletCards, Zap, PencilLine, GraduationCap, BookOpen, Hammer,
  FileArchive, FileDown, Fuel, Stethoscope, LockKeyhole, NotebookText
}

export default function Icon({ name, size = 22, strokeWidth = 2.25 }) {
  const LucideIcon = icons[name] || Heart
  return <LucideIcon size={size} strokeWidth={strokeWidth} aria-hidden="true" />
}
