export const metadata = {
  title: 'Quiz Party Game',
  description: 'A fun party quiz game where players answer questions about themselves and each other',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
