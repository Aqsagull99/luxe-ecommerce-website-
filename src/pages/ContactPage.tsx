import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'hello@maisonluxe.pk', sub: 'We respond within 24 hours' },
  { icon: Phone, label: 'Phone', value: '+92 300 1234567', sub: 'Mon–Sat, 10AM–7PM' },
  { icon: MapPin, label: 'Address', value: 'Gulberg III, Lahore, Pakistan', sub: 'By appointment only' },
  { icon: Clock, label: 'Hours', value: 'Mon–Sat: 10AM–7PM', sub: 'Sun: Closed' },
]

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSubmitted(true)
    setLoading(false)
  }

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-sidebar py-16 text-center px-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm tracking-widest uppercase text-sidebar-foreground/50 mb-3"
        >
          Get in Touch
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-4xl font-semibold text-sidebar-foreground mb-3"
        >
          Contact Us
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sidebar-foreground/60 max-w-md mx-auto"
        >
          Have a question about our products or your order? We're here to help.
        </motion.p>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact info */}
          <div className="lg:col-span-2">
            <h2 className="font-serif text-2xl font-semibold mb-6">Reach Out</h2>
            <div className="flex flex-col gap-5">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex gap-4">
                  <div className="size-10 rounded-sm bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{item.label}</p>
                    <p className="font-medium text-sm mt-0.5">{item.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-muted rounded-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="size-4 text-muted-foreground" />
                <p className="text-sm font-medium">WhatsApp Support</p>
              </div>
              <p className="text-xs text-muted-foreground">
                For faster responses, chat with us on WhatsApp at +92 300 1234567 during business hours.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-sm p-6 sm:p-8">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="size-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <Send className="size-7 text-green-600" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground text-sm">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                  <Button className="mt-6" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }}>
                    Send Another
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5">
                  <h2 className="font-serif text-xl font-semibold">Send a Message</h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Your name" value={form.name} onChange={update('name')} required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} required />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="subject">Subject</Label>
                    <Select onValueChange={(v) => setForm((f) => ({ ...f, subject: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="order">Order & Shipping</SelectItem>
                        <SelectItem value="product">Product Information</SelectItem>
                        <SelectItem value="return">Returns & Exchanges</SelectItem>
                        <SelectItem value="payment">Payment Issue</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe your question or concern in detail..."
                      value={form.message}
                      onChange={update('message')}
                      className="min-h-32"
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="gap-2" disabled={loading}>
                    {loading ? 'Sending...' : <><Send className="size-4" /> Send Message</>}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
