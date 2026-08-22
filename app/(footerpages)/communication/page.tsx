import type { Metadata } from 'next'
import MapWidget from './mapWidget'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export const metadata: Metadata = {
  title: 'Communication',
  description:
    'Get in touch with Aegean Market — find our location, opening hours, contact details, and send us a message.',
}

export default function CommunicationPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 md:px-10 py-12">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-aegean-dark mb-2">
          Communication
        </h1>
        <div className="h-1 w-20 bg-aegean-green mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        <div className="flex flex-col gap-8">
          <div>
            <h3 className="text-2xl font-bold text-aegean-dark mb-4">
              Our Location
            </h3>
            <p className="text-lg font-medium text-aegean-green-text underline mb-4">
              Mytilene, Lesvos, Greece
            </p>

            <div className="space-y-2 text-muted-foreground bg-aegean-gray p-6 rounded-lg border border-border">
              <p className="flex justify-between">
                <span className="font-semibold">Mon - Tue:</span>
                <span>
                  10:00am - 4:00pm{' '}
                  <span className="text-xs text-muted-foreground">(Appointment)</span>
                </span>
              </p>
              <p className="flex justify-between">
                <span className="font-semibold">Wed - Sat:</span>
                <span>10:00am - 4:00pm</span>
              </p>
              <p className="flex justify-between text-destructive">
                <span className="font-semibold">Sunday:</span>
                <span className="font-bold">Closed</span>
              </p>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden shadow-xl border-4 border-white">
            <MapWidget />
          </div>

          {/* Quick Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-border rounded-lg shadow-sm">
              <h3 className="font-bold text-aegean-dark">Telephone</h3>
              <h4 className="text-aegean-green-text hover:underline">
                +30 22510 12345
              </h4>
            </div>
            <div className="p-4 bg-white border border-border rounded-lg shadow-sm">
              <h3 className="font-bold text-aegean-dark">Email</h3>
              <h4 className="text-aegean-green-text hover:underline break-all">
                info@mytilene.com
              </h4>
            </div>
          </div>
        </div>

        <div className="bg-white p-12 rounded-lg shadow-2xl border border-border lg:w-full lg:max-w-200 justify-self-center">
          <h3 className="text-3xl font-bold text-aegean-dark mb-8 text-center md:text-left">
            Send us a Message
          </h3>

          <form action="" className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <Label htmlFor="name">Full Name</Label>
                <Input type="text" id="name" name="name" placeholder="e.g. John Doe" />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="subject">Subject</Label>
              <Input
                type="text"
                id="subject"
                name="subject"
                placeholder="How can we help you?"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                name="message"
                rows={6}
                placeholder="Write your message here..."
              />
            </div>

            <Button type="submit" variant="buy" size="lg" className="mt-4 font-bold">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
