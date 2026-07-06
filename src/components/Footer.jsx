const footerLinks = [
  {
    title: "Company",
    links: ["About Us", "Our Fleet", "Careers", "Contact"]
  },
  {
    title: "Services",
    links: ["Chauffeur Service", "Airport Transfer", "Long Term Rental", "Corporate"]
  },
  {
    title: "Legal",
    links: ["Terms of Service", "Privacy Policy", "Cancellation Policy", "Insurance"]
  }
]

export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-2">
            <a href="#home" className="inline-block text-xl font-bold text-white mb-3 tracking-tight">
              Zudo<span className="text-blue-500">Cars</span>
            </a>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-4">
              Premium car rental service with the best vehicles and unmatched customer support.
            </p>
            <p className="text-sm text-gray-400">
              <span className="text-gray-500">Contact:</span> info@drivehub.com
            </p>
          </div>

          {/* Map Link Columns */}
          {footerLinks.map((section) => (
            <div key={section.title} className="col-span-1">
              <h4 className="text-gray-200 font-semibold text-xs tracking-wider uppercase mb-3.5">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 DriveHub. All rights reserved.</p>
          
          <div className="flex gap-5">
            <a href="#" className="hover:text-gray-400 transition-colors">Facebook</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Instagram</a>
          </div>
        </div>

      </div>
    </footer>
  )
}