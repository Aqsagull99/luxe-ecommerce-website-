import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SEO } from '@/components/SEO'
import { Award, Leaf, Heart, Users, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const values = [
  { icon: Award, title: 'Uncompromising Quality', desc: 'Each piece is handpicked for craftsmanship, materials, and enduring beauty. We source only from artisans who share our vision of perfection.' },
  { icon: Leaf, title: 'Sustainable Luxury', desc: 'We believe luxury and responsibility coexist. Our collections prioritize ethically sourced materials and sustainable production practices.' },
  { icon: Heart, title: 'Curated with Passion', desc: 'Every product in our catalogue is personally selected by our team of design experts with decades of experience in luxury interiors.' },
  { icon: Users, title: 'Customer Obsessed', desc: 'From first browse to delivery and beyond, we are committed to an exceptional experience. Our support team is here when you need us.' },
]

const team = [
  { name: 'Amara Siddiqui', role: 'Founder & Creative Director', bio: '15 years in luxury interior design across Dubai and London.' },
  { name: 'Zain Ahmed', role: 'Head of Procurement', bio: 'Sources from over 40 artisans globally with a focus on heritage craftsmanship.' },
  { name: 'Nadia Hussain', role: 'Customer Experience Lead', bio: 'Ensures every client feels like family from first click to last delivery.' },
]

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="About Us" description="Discover the story behind Maison Luxe — Pakistan's premier destination for handcrafted luxury home decor and furniture." />
      {/* Hero */}
      <div className="relative h-96 bg-sidebar overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative z-10 text-center px-4">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sidebar-foreground/50 text-sm tracking-widest uppercase mb-3"
          >
            Our Story
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl font-semibold text-sidebar-foreground mb-4"
          >
            About Maison Luxe
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sidebar-foreground/60 max-w-xl mx-auto leading-relaxed"
          >
            Where exceptional craftsmanship meets timeless design. We bring the world's finest home decor to Pakistan.
          </motion.p>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-16">
        {/* Mission */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-sm tracking-widest uppercase text-muted-foreground mb-3">Our Mission</p>
            <h2 className="font-serif text-4xl font-semibold mb-5 leading-tight">
              Transforming spaces into stories
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Founded in 2019, Maison Luxe was born from a simple belief: your home should be a sanctuary of beauty and meaning. We scour artisan workshops from Morocco to Japan to bring you pieces that transcend trends.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Each item in our catalogue carries a story — of the hands that made it, the heritage it represents, and the home it will enrich. We are not just a store; we are curators of living culture.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="aspect-square rounded-sm overflow-hidden bg-muted"
          >
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600"
              alt="Luxurious interior"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <p className="text-sm tracking-widest uppercase text-muted-foreground mb-2">What We Stand For</p>
            <h2 className="font-serif text-3xl font-semibold">Our Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-sm p-6"
              >
                <div className="size-10 rounded-sm bg-muted flex items-center justify-center mb-4">
                  <v.icon className="size-5 text-foreground" />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <p className="text-sm tracking-widest uppercase text-muted-foreground mb-2">The People Behind</p>
            <h2 className="font-serif text-3xl font-semibold">Our Team</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="size-20 rounded-full bg-muted mx-auto mb-4 overflow-hidden">
                  <div className="w-full h-full bg-sidebar flex items-center justify-center text-sidebar-foreground font-serif text-2xl font-semibold">
                    {member.name[0]}
                  </div>
                </div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-primary mb-2">{member.role}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-sidebar rounded-sm p-12">
          <h2 className="font-serif text-3xl font-semibold text-sidebar-foreground mb-3">
            Ready to elevate your space?
          </h2>
          <p className="text-sidebar-foreground/60 mb-6 max-w-md mx-auto">
            Browse our curated collection of premium home decor pieces.
          </p>
          <Button size="lg" variant="outline" className="gap-2 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent" asChild>
            <Link to="/products">
              Shop the Collection <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
