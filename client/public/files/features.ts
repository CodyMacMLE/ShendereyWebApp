import { ShieldCheckIcon, GlobeEuropeAfricaIcon, BoltIcon, CheckIcon } from '@heroicons/react/20/solid'

type Feature = {
    name: string;
    description: string;
    icon: React.ElementType;
}

export const facilityFeatures: Feature[] = [
    {
      name: 'Safety First.',
      description:
        'Our equipment is of the highest safety that can be provided in the sport. Our equipment is also checked daily by staff to ensure the highest level safety for your children.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'International Ready.',
      description: 'Our facility provides international renowned equipment for the athletes to train on. This means that the equipment your child trains on is the same equipment as the olympians allowing for smoother transitions to competitions.',
      icon: GlobeEuropeAfricaIcon,
    },
    {
      name: 'Modern Methods.',
      description: 'Our facility is equipped with modern systems to provide the best training to your children. This includes multiple bungee systems, foam pits and air conditioning',
      icon: BoltIcon,
    },
]

export const RecreationalFeatures: Feature[] = [
  {
      name: 'Physical Development.',
      description:
      'It helps improve overall physical fitness by focusing on strength, flexibility, balance, and coordination. Gymnastics builds muscular endurance, agility, and control',
      icon: CheckIcon,
  },
  {
      name: 'Confidence and Independence.',
      description: 
      'By mastering new skills, participants build confidence in their abilities. In younger age groups, the focus on independence in a group setting fosters self-reliance and social interaction.',
      icon: CheckIcon,
  },
  {
      name: 'Fun and Enjoyment.',
      description:
      'Unlike competitive gymnastics, recreational programs prioritize fun and enjoyment. Classes are often designed with games, activities, and challenges that make learning gymnastics enjoyable.',
      icon: CheckIcon,
  },
  {
      name: 'Social Skills.',
      description:
      'Recreational gymnastics allows children and teens to interact with peers, work together, and develop teamwork and communication skills.',
      icon: CheckIcon,
  }
]