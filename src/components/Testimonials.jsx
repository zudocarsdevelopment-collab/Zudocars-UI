  import { Star, Quote } from 'lucide-react'

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Business Traveler',
      location: 'New York, USA',
      rating: 5,
      comment: 'Absolutely fantastic service! The Tesla Model 3 I rented was in pristine condition. The booking process was seamless and the staff was incredibly helpful.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    },
    {
      name: 'Michael Chen',
      role: 'Family Vacation',
      location: 'San Francisco, USA',
      rating: 5,
      comment: 'Rented a BMW X5 for our family road trip. Spacious, comfortable, and the kids loved it. DriveHub made our vacation truly memorable.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    {
      name: 'Emma Rodriguez',
      role: 'Weekend Getaway',
      location: 'Miami, USA',
      rating: 5,
      comment: 'The luxury Mercedes was a dream to drive. Best rates I found online and the car was delivered right to my doorstep. Will definitely use again!',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    },
  ]

  export default function Testimonials() {
    return (
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-blue-600 text-sm font-semibold tracking-wide uppercase">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Thousands of satisfied customers trust DriveHub for their car rental needs. 
              Here's what they have to say.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300"
              >
                <Quote className="w-8 h-8 text-blue-200 mb-4" />

                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-6">{t.comment}</p>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role} · {t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
