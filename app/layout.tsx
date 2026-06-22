import type { Metadata } from 'next';
import './globals.css';

const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Elevare Treinamentos';

export const metadata: Metadata = {
  title: appName,
  description: 'Plataforma SaaS de treinamentos corporativos com gamificação e IA',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
