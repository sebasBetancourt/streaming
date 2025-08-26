import { Header } from "../components/Header";
import { HeroSection } from "../components/HeroSection";
import { ContentRow } from "../components/ContentRow";
import { Footer } from "../components/Footer";

const popularOnNetflix = [
  {
    id: "p1",
    title: "Squid Game",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=225&fit=crop&auto=format",
    year: "2021",
    rating: "8.0",
    duration: "1 Season",
    description: "Players compete in deadly children's games for a massive cash prize."
  },
  {
    id: "p2",
    title: "Kingdom",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop&auto=format",
    year: "2019",
    rating: "8.3",
    duration: "2 Seasons",
    description: "A crown prince investigates a mysterious plague that turns people into monsters."
  },
  {
    id: "p3",
    title: "Crash Landing on You",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=225&fit=crop&auto=format",
    year: "2019",
    rating: "8.7",
    duration: "1 Season",
    description: "An heiress accidentally paraglides into North Korea and falls in love."
  },
  {
    id: "p4",
    title: "Vincenzo",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop&auto=format",
    year: "2021",
    rating: "8.4",
    duration: "1 Season",
    description: "An Italian mafia lawyer returns to Korea and gets involved with locals."
  },
  {
    id: "p5",
    title: "Goblin",
    image: "https://images.unsplash.com/photo-1520637836862-4d197d17c559?w=400&h=225&fit=crop&auto=format",
    year: "2016",
    rating: "8.6",
    duration: "1 Season",
    description: "An immortal goblin seeks his bride to end his eternal life."
  },
  {
    id: "p6",
    title: "The Glory",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop&auto=format",
    year: "2022",
    rating: "8.1",
    duration: "1 Season",
    description: "A woman seeks revenge against her former classmates who bullied her."
  },
  {
    id: "p7",
    title: "Hometown Cha-Cha-Cha",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=225&fit=crop&auto=format",
    year: "2021",
    rating: "8.7",
    duration: "1 Season",
    description: "A city dentist moves to a seaside village and meets a helpful handyman."
  }
];

const trendingNow = [
  {
    id: "t1",
    title: "Business Proposal",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=225&fit=crop&auto=format",
    year: "2022",
    rating: "8.1",
    duration: "1 Season",
    description: "An employee goes on a blind date pretending to be her friend."
  },
  {
    id: "t2",
    title: "Hospital Playlist",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=225&fit=crop&auto=format",
    year: "2020",
    rating: "9.1",
    duration: "2 Seasons",
    description: "Five doctors who have been friends since medical school navigate life together."
  },
  {
    id: "t3",
    title: "Reply 1988",
    image: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=225&fit=crop&auto=format",
    year: "2015",
    rating: "9.0",
    duration: "1 Season",
    description: "Coming-of-age story of five friends and their families in 1980s Seoul."
  },
  {
    id: "t4",
    title: "Twenty-Five Twenty-One",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=225&fit=crop&auto=format",
    year: "2022",
    rating: "8.8",
    duration: "1 Season",
    description: "A young fencer's coming-of-age story during Korea's financial crisis."
  },
  {
    id: "t5",
    title: "Itaewon Class",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=225&fit=crop&auto=format",
    year: "2020",
    rating: "8.2",
    duration: "1 Season",
    description: "An ex-convict opens a bar-restaurant and seeks revenge against a corporation."
  },
  {
    id: "t6",
    title: "Sweet Home",
    image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400&h=225&fit=crop&auto=format",
    year: "2020",
    rating: "7.3",
    duration: "2 Seasons",
    description: "Residents fight to survive against monsters born from human desires."
  }
];

const topTenKorea = [
  {
    id: "tt1",
    title: "Squid Game",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=225&fit=crop&auto=format",
    year: "2021",
    rating: "8.0",
    duration: "1 Season",
    rank: "1",
    description: "Players compete in deadly children's games for money."
  },
  {
    id: "tt2",
    title: "Kingdom",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop&auto=format",
    year: "2019",
    rating: "8.3",
    duration: "2 Seasons",
    rank: "2",
    description: "A crown prince investigates a zombie plague in medieval Korea."
  },
  {
    id: "tt3",
    title: "Crash Landing on You",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=225&fit=crop&auto=format",
    year: "2019",
    rating: "8.7",
    duration: "1 Season",
    rank: "3",
    description: "South Korean heiress crash lands in North Korea."
  },
  {
    id: "tt4",
    title: "Vincenzo",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop&auto=format",
    year: "2021",
    rating: "8.4",
    duration: "1 Season",
    rank: "4",
    description: "Italian mafia lawyer returns to Korea."
  },
  {
    id: "tt5",
    title: "The Glory",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop&auto=format",
    year: "2022",
    rating: "8.1",
    duration: "1 Season",
    rank: "5",
    description: "A woman plans elaborate revenge against her bullies."
  },
  {
    id: "tt6",
    title: "Goblin",
    image: "https://images.unsplash.com/photo-1520637836862-4d197d17c559?w=400&h=225&fit=crop&auto=format",
    year: "2016",
    rating: "8.6",
    duration: "1 Season",
    rank: "6",
    description: "An immortal goblin seeks his destined bride."
  },
  {
    id: "tt7",
    title: "Hospital Playlist",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=225&fit=crop&auto=format",
    year: "2020",
    rating: "9.1",
    duration: "2 Seasons",
    rank: "7",
    description: "Five doctor friends navigate work and relationships."
  },
  {
    id: "tt8",
    title: "Business Proposal",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=225&fit=crop&auto=format",
    year: "2022",
    rating: "8.1",
    duration: "1 Season",
    rank: "8",
    description: "Fake dating leads to real romance."
  },
  {
    id: "tt9",
    title: "Hometown Cha-Cha-Cha",
    image: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=225&fit=crop&auto=format",
    year: "2021",
    rating: "8.7",
    duration: "1 Season",
    rank: "9",
    description: "City dentist finds love in a seaside village."
  },
  {
    id: "tt10",
    title: "Reply 1988",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=225&fit=crop&auto=format",
    year: "2015",
    rating: "9.0",
    duration: "1 Season",
    rank: "10",
    description: "Nostalgic tale of friendship and family in 1980s Seoul."
  }
];

const romanticDramas = [
  {
    id: "r1",
    title: "It's Okay to Not Be Okay",
    image: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=225&fit=crop&auto=format",
    year: "2020",
    rating: "8.9",
    duration: "1 Season",
    description: "A caregiver meets a children's book author with antisocial disorder."
  },
  {
    id: "r2",
    title: "What's Wrong with Secretary Kim",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=225&fit=crop&auto=format",
    year: "2018",
    rating: "8.0",
    duration: "1 Season",
    description: "A narcissistic vice chairman tries to win back his perfect secretary."
  },
  {
    id: "r3",
    title: "Strong Woman Do Bong Soon",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=225&fit=crop&auto=format",
    year: "2017",
    rating: "8.2",
    duration: "1 Season",
    description: "A woman with superhuman strength becomes a bodyguard for a CEO."
  },
  {
    id: "r4",
    title: "Our Beloved Summer",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=225&fit=crop&auto=format",
    year: "2021",
    rating: "8.3",
    duration: "1 Season",
    description: "Ex-lovers reunite for a documentary about their past relationship."
  },
  {
    id: "r5",
    title: "Romance is a Bonus Book",
    image: "https://images.unsplash.com/photo-1520637836862-4d197d17c559?w=400&h=225&fit=crop&auto=format",
    year: "2019",
    rating: "7.8",
    duration: "1 Season",
    description: "A divorced woman gets a job where her younger friend works."
  },
  {
    id: "r6",
    title: "Her Private Life",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop&auto=format",
    year: "2019",
    rating: "7.7",
    duration: "1 Season",
    description: "A professional art curator secretly runs a K-pop fansite."
  }
];

const thrillerAction = [
  {
    id: "ta1",
    title: "Signal",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop&auto=format",
    year: "2016",
    rating: "9.0",
    duration: "1 Season",
    description: "A detective communicates with the past via walkie-talkie."
  },
  {
    id: "ta2",
    title: "Stranger",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop&auto=format",
    year: "2017",
    rating: "8.8",
    duration: "2 Seasons",
    description: "An emotionless prosecutor fights corruption."
  },
  {
    id: "ta3",
    title: "My Name",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=225&fit=crop&auto=format",
    year: "2021",
    rating: "7.8",
    duration: "1 Season",
    description: "A woman goes undercover to avenge her father's murder."
  },
  {
    id: "ta4",
    title: "Taxi Driver",
    image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400&h=225&fit=crop&auto=format",
    year: "2021",
    rating: "8.2",
    duration: "2 Seasons",
    description: "A mysterious taxi service carries out revenge for victims."
  },
  {
    id: "ta5",
    title: "Mouse",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=225&fit=crop&auto=format",
    year: "2021",
    rating: "8.7",
    duration: "1 Season",
    description: "A police officer questions whether psychopaths are born or made."
  },
  {
    id: "ta6",
    title: "Hellbound",
    image: "https://images.unsplash.com/photo-1578473026033-ba0c4cb3c4e4?w=400&h=225&fit=crop&auto=format",
    year: "2021",
    rating: "6.6",
    duration: "1 Season",
    description: "Supernatural beings condemn people to hell."
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <HeroSection />
      
      <div className="relative z-10 -mt-32 pb-20">
        <ContentRow title="Explore" items={popularOnNetflix} />
        {/* Ranking Page */}
        <ContentRow title="Popular on Netflix" items={popularOnNetflix} />
        <ContentRow title="Trending Now" items={trendingNow} />
        <ContentRow title="Top 10 in Korea Today" items={topTenKorea} showRank />
        <ContentRow title="K-Drama Romance" items={romanticDramas} />
        <ContentRow title="Thriller & Crime" items={thrillerAction} />
      </div>
      
      <Footer />
    </div>
  );
}