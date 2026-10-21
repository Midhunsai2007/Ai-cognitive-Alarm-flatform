import './globals.css';
import ClientShell from './ClientShell';

export const metadata = {
  title: 'CognAlarm — Intelligent Cognitive Alarm Platform',
  description: 'AI-Powered Personalized Alarm System with XGBoost & Reinforcement Learning in Warm Cream & Brown Design.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
