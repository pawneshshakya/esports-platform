import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-card text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-orange-500">Local Rummy</h3>
            <p className="text-muted-foreground">
              Experience the thrill of playing online rummy games on Local Rummy. Win big with our exciting cash prizes and tournaments.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-orange-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-to-play" className="text-muted-foreground hover:text-orange-400">
                  How to Play
                </Link>
              </li>
              <li>
                <Link href="/tournaments" className="text-muted-foreground hover:text-orange-400">
                  Tournaments
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="text-muted-foreground hover:text-orange-400">
                  Promotions
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-orange-400">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-orange-400">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-orange-400">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-orange-400">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Download App</h3>
            <p className="text-muted-foreground">Get the Local Rummy app for a better experience on mobile.</p>
            <div className="flex space-x-4">
              <Link href="#" className="text-white bg-muted px-4 py-2 rounded flex items-center hover:bg-muted">
                Android
              </Link>
              <Link href="#" className="text-white bg-muted px-4 py-2 rounded flex items-center hover:bg-muted">
                iOS
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Local Rummy. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="#" className="text-muted-foreground hover:text-orange-400">
                Facebook
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-orange-400">
                Twitter
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-orange-400">
                Instagram
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-orange-400">
                YouTube
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
