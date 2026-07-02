import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { mukubesaMundia, mulazaKaira, scartChansa, garyNkombo, willahMudolo, christopherKangombe, josephKalimbwe } from '../../data/leaderPhotos';
import vincentKafulaLeaderPhoto from '../../../imports/vincent_61.png';
import { leadershipApi, Leader } from '../../lib/api';
import {
  ZAMBIA_HIERARCHY,
  getDistricts,
  getConstituencies,
  getWards,
  getBranchLeaders,
} from '../../data/zambiaWards';

const COMMUNITY_IMG = 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop&auto=format';
const YOUTH_IMG     = 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=700&h=500&fit=crop&auto=format';

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="block w-8 h-0.5" style={{ backgroundColor: '#dc2626' }} />
      <span className="text-xs tracking-widest uppercase" style={{ color: '#dc2626', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.2em', fontWeight: 600 }}>
        {text}
      </span>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>
      {children}
    </h2>
  );
}

function BodyText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`leading-relaxed ${className}`} style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.85 }}>
      {children}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 my-4">
      {items.map(item => (
        <li key={item} className="flex items-start gap-3">
          <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: '#dc2626' }} />
          <span style={{ color: '#d1d5db', fontSize: '15px', lineHeight: 1.7 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Blockquote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-6 pl-5 italic" style={{ borderLeft: '3px solid #dc2626', color: '#d1d5db', fontSize: '15px', lineHeight: 1.8 }}>
      {children}
    </blockquote>
  );
}

interface Leader {
  name: string;
  position: string;
  description: string;
  image: string;
  whiteBg?: boolean;
  redacted?: boolean;
}

function LeaderCard({ leader }: { leader: Leader }) {
  return (
    <div
      className="group overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: '#111',
        border: '1px solid #1f1f1f',
      }}
    >
      {/* Leader Photo */}
      <div
        className="relative overflow-hidden"
        style={{ height: '280px', backgroundColor: leader.redacted ? '#111' : leader.whiteBg ? '#ffffff' : undefined }}
      >
        {leader.redacted ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <svg viewBox="0 0 80 80" width="64" height="64" fill="none">
              <circle cx="40" cy="28" r="18" fill="#2a2a2a" />
              <ellipse cx="40" cy="72" rx="30" ry="18" fill="#2a2a2a" />
            </svg>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.14em', color: '#444' }}>IDENTITY PENDING</span>
          </div>
        ) : (
          <ImageWithFallback
            src={leader.image}
            alt={leader.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            style={{ objectPosition: 'center' }}
          />
        )}
        <div
          className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          style={{
            background: 'linear-gradient(to top, rgba(220,38,38,0.4) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Leader Info */}
      <div className="p-5">
        <h4
          className="mb-1 text-white"
          style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: '1.1rem',
            letterSpacing: '0.06em',
            fontWeight: 600,
          }}
        >
          {leader.redacted ? (
            <span className="inline-flex flex-col gap-1.5">
              <span style={{ display: 'inline-block', width: '110px', height: '13px', backgroundColor: '#2a2a2a', borderRadius: '3px' }} />
              <span style={{ display: 'inline-block', width: '75px', height: '13px', backgroundColor: '#2a2a2a', borderRadius: '3px' }} />
            </span>
          ) : leader.name}
        </h4>
        <p
          className="mb-3"
          style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: '0.85rem',
            letterSpacing: '0.08em',
            color: '#dc2626',
            textTransform: 'uppercase',
          }}
        >
          {leader.position}
        </p>
        <p
          style={{
            color: '#9ca3af',
            fontSize: '13px',
            lineHeight: 1.7,
          }}
        >
          {leader.description}
        </p>
      </div>
    </div>
  );
}

const ZAMBIA_PROVINCES = [
  'Central Province',
  'Copperbelt Province',
  'Eastern Province',
  'Luapula Province',
  'Lusaka Province',
  'Muchinga Province',
  'North-Western Province',
  'Northern Province',
  'Southern Province',
  'Western Province',
] as const;

type ZambiaProvince = typeof ZAMBIA_PROVINCES[number];

interface ProvinceLeader {
  name: string;
  position: string;
  description: string;
  image: string;
}

const PROVINCIAL_LEADERS: Record<ZambiaProvince, ProvinceLeader[]> = {
  'Central Province': [
    { name: 'Chanda Mwape', position: 'Chairperson', description: 'Lead and preside over the Central Province Executive Committee meetings. Champion party growth across Kabwe, Mkushi, and surrounding districts.', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&auto=format' },
    { name: 'Bridget Ng\'andu', position: 'Deputy Chairperson', description: 'Support provincial leadership and coordinate women-inclusive programmes across Central Province.', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&auto=format' },
    { name: 'Mutale Kasonde', position: 'Secretary', description: 'Manage day-to-day provincial administration, record minutes and coordinate with district secretaries in Kabwe and Mkushi.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&auto=format' },
    { name: 'Luckson Phiri', position: 'Deputy Secretary', description: 'Assist the Provincial Secretary in administration and liaison with district structures across Central Province.', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=500&fit=crop&auto=format' },
    { name: 'Agnes Chisanga', position: 'Treasurer General', description: 'Oversee provincial financial management, prepare budgets and coordinate fundraising for Central Province operations.', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=500&fit=crop&auto=format' },
    { name: 'Patrick Zulu', position: 'Deputy Treasurer', description: 'Support financial oversight across Central Province district structures and ensure timely financial reporting.', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&auto=format' },
    { name: 'Emmanuel Nkonde', position: 'Youth Leader', description: 'Drive youth mobilisation across Kabwe, Chibombo, Mkushi, Kapiri-Mposhi and all districts of Central Province.', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&auto=format' },
    { name: 'Grace Tembo', position: 'Women Leader', description: 'Champion women\'s representation, empowerment and gender equity across all provincial party activities in Central Province.', image: 'https://images.unsplash.com/photo-1542190891-2093d38760f2?w=400&h=500&fit=crop&auto=format' },
  ],
  'Copperbelt Province': [
    { name: 'Bwalya Musonda', position: 'Chairperson', description: 'Lead the Copperbelt Provincial Executive Committee and represent the party across the mining heartland from Ndola to Chingola.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&auto=format' },
    { name: 'Nkandu Chipasha', position: 'Deputy Chairperson', description: 'Support party leadership and oversee special programmes for mine workers and urban communities on the Copperbelt.', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=500&fit=crop&auto=format' },
    { name: 'Josephine Mukupa', position: 'Secretary', description: 'Coordinate administrative operations across Ndola, Kitwe, Mufulira, Luanshya, Chingola, Chililabombwe and Kalulushi districts.', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop&auto=format' },
    { name: 'Charles Mwangilwa', position: 'Deputy Secretary', description: 'Assist in managing Copperbelt\'s extensive district network and ensure communication between all provincial structures.', image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400&h=500&fit=crop&auto=format' },
    { name: 'Miriam Kafula', position: 'Treasurer General', description: 'Manage provincial funds and oversee financial transparency for the Copperbelt\'s large and active party membership.', image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=500&fit=crop&auto=format' },
    { name: 'Chisomo Banda', position: 'Deputy Treasurer', description: 'Monitor district-level financial activities and support auditing processes across the Copperbelt\'s many districts.', image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=500&fit=crop&auto=format' },
    { name: 'Kelvin Sinkamba', position: 'Youth Leader', description: 'Mobilise young people in Copperbelt\'s urban and peri-urban areas, connecting youth employment with party programmes.', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop&auto=format' },
    { name: 'Pauline Mwale', position: 'Women Leader', description: 'Advocate for women\'s rights and representation across Copperbelt\'s diverse urban communities and mining settlements.', image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=500&fit=crop&auto=format' },
  ],
  'Eastern Province': [
    { name: 'Elias Phiri', position: 'Chairperson', description: 'Preside over Eastern Province Executive Committee meetings and represent the party across Chipata, Petauke, Katete and surrounding districts.', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop&auto=format' },
    { name: 'Lindiwe Banda', position: 'Deputy Chairperson', description: 'Support the Chairperson in provincial leadership and oversee development programmes across Eastern Province.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop&auto=format' },
    { name: 'Gabriel Lungu', position: 'Secretary', description: 'Administer provincial operations based in Chipata, liaising with district secretaries across all Eastern Province districts.', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&auto=format' },
    { name: 'Stella Mbewe', position: 'Deputy Secretary', description: 'Assist provincial administration and ensure effective flow of information between provincial and district structures.', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop&auto=format' },
    { name: 'Andrew Phiri', position: 'Treasurer General', description: 'Manage all Eastern Province party funds, oversee budgets and coordinate provincial fundraising activities.', image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=500&fit=crop&auto=format' },
    { name: 'Mercy Tembo', position: 'Deputy Treasurer', description: 'Support financial management across Eastern Province and monitor compliance with party financial policies.', image: 'https://images.unsplash.com/photo-1502767089025-6572583495f9?w=400&h=500&fit=crop&auto=format' },
    { name: 'Joshua Nyirenda', position: 'Youth Leader', description: 'Champion youth engagement and mobilisation across Chipata, Petauke, Nyimba, Chadiza, Katete and Lundazi districts.', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop&auto=format' },
    { name: 'Eunice Chirwa', position: 'Women Leader', description: 'Lead women\'s empowerment programmes and gender equity advocacy across all Eastern Province communities.', image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=500&fit=crop&auto=format' },
  ],
  'Luapula Province': [
    { name: 'Jackson Mwansa', position: 'Chairperson', description: 'Lead the Luapula Provincial Executive Committee and champion party interests from Mansa to Nchelenge on Lake Mweru.', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop&auto=format' },
    { name: 'Charity Mulenga', position: 'Deputy Chairperson', description: 'Support provincial leadership and champion development programmes for fishing communities along Luapula River.', image: 'https://images.unsplash.com/photo-1542190891-2093d38760f2?w=400&h=500&fit=crop&auto=format' },
    { name: 'Bernard Chama', position: 'Secretary', description: 'Manage provincial administrative operations based in Mansa and coordinate communication with all Luapula district structures.', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&auto=format' },
    { name: 'Faith Mwape', position: 'Deputy Secretary', description: 'Assist in managing Luapula\'s administrative needs and support coordination with Kawambwa, Samfya and Nchelenge districts.', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&auto=format' },
    { name: 'Richard Bwalya', position: 'Treasurer General', description: 'Oversee all Luapula Province financial management, ensuring fiscal responsibility across a geographically diverse province.', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&auto=format' },
    { name: 'Doreen Kalyata', position: 'Deputy Treasurer', description: 'Support financial activities across Luapula Province districts and assist in preparing provincial financial reports.', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&auto=format' },
    { name: 'Daniel Musumali', position: 'Youth Leader', description: 'Engage youth in Mansa, Kawambwa, Samfya, Nchelenge, Chembe, and all Luapula Province districts.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&auto=format' },
    { name: 'Veronica Chanda', position: 'Women Leader', description: 'Advocate for women\'s participation in politics and community development across Luapula Province.', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=500&fit=crop&auto=format' },
  ],
  'Lusaka Province': [
    { name: 'George Mutale', position: 'Chairperson', description: 'Lead the Lusaka Provincial Executive Committee covering the nation\'s capital and surrounding districts including Chongwe and Kafue.', image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=500&fit=crop&auto=format' },
    { name: 'Natasha Chanda', position: 'Deputy Chairperson', description: 'Support provincial leadership and oversee youth and women programmes across Lusaka\'s urban and peri-urban constituencies.', image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=500&fit=crop&auto=format' },
    { name: 'David Hamusonde', position: 'Secretary', description: 'Manage provincial operations across Lusaka, Kafue, Chongwe and Rufunsa districts, coordinating with the national headquarters.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&auto=format' },
    { name: 'Precious Mulenga', position: 'Deputy Secretary', description: 'Assist in Lusaka Province administration and ensure seamless communication between the provincial office and all districts.', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=500&fit=crop&auto=format' },
    { name: 'Oscar Tembo', position: 'Treasurer General', description: 'Manage Lusaka Province\'s extensive party finances and oversee the largest provincial budget in the country.', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop&auto=format' },
    { name: 'Lucy Mutale', position: 'Deputy Treasurer', description: 'Support financial management and monitoring of Lusaka Province\'s numerous district and branch financial activities.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop&auto=format' },
    { name: 'Bwalya Chama', position: 'Youth Leader', description: 'Lead youth mobilisation across Lusaka\'s urban constituencies, championing employment, education and civic engagement.', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop&auto=format' },
    { name: 'Mwamba Chanda', position: 'Women Leader', description: 'Drive women\'s empowerment and representation across all Lusaka Province communities, from city centre to rural Rufunsa.', image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400&h=500&fit=crop&auto=format' },
  ],
  'Muchinga Province': [
    { name: 'Samson Malama', position: 'Chairperson', description: 'Lead the Muchinga Provincial Executive Committee and represent the party across Chinsali, Nakonde, Isoka, Mpika and surrounding areas.', image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=500&fit=crop&auto=format' },
    { name: 'Gertrude Mulenga', position: 'Deputy Chairperson', description: 'Support provincial leadership and coordinate cross-district programmes across Muchinga\'s diverse communities.', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop&auto=format' },
    { name: 'Alfred Simumba', position: 'Secretary', description: 'Manage administrative operations for Muchinga Province, liaising with Chinsali, Isoka, Nakonde, Mpika and Shiwang\'andu districts.', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop&auto=format' },
    { name: 'Josephine Nkonde', position: 'Deputy Secretary', description: 'Assist in managing Muchinga Province administration and support inter-district communication and coordination.', image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=500&fit=crop&auto=format' },
    { name: 'Webster Chanda', position: 'Treasurer General', description: 'Oversee Muchinga Province\'s financial management and ensure fiscal accountability across all district structures.', image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=500&fit=crop&auto=format' },
    { name: 'Maureen Ngosa', position: 'Deputy Treasurer', description: 'Support the Treasurer General in managing Muchinga Province finances and monitoring district-level financial compliance.', image: 'https://images.unsplash.com/photo-1502767089025-6572583495f9?w=400&h=500&fit=crop&auto=format' },
    { name: 'Friday Mumba', position: 'Youth Leader', description: 'Drive youth engagement across Chinsali, Nakonde, Isoka, Mpika, Shiwang\'andu and Lavushi Manda districts.', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&auto=format' },
    { name: 'Chisomo Mwale', position: 'Women Leader', description: 'Advocate for women\'s empowerment and gender-responsive programmes across all Muchinga Province communities.', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=500&fit=crop&auto=format' },
  ],
  'North-Western Province': [
    { name: 'Solomon Kasongo', position: 'Chairperson', description: 'Lead the North-Western Provincial Executive Committee and represent the party across Solwezi, Mwinilunga, Kabompo and surrounding districts.', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=500&fit=crop&auto=format' },
    { name: 'Anastasia Mwanawasa', position: 'Deputy Chairperson', description: 'Support provincial leadership and champion development programmes for North-Western Province\'s communities.', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop&auto=format' },
    { name: 'Peter Kaoma', position: 'Secretary', description: 'Coordinate provincial administration from Solwezi and liaise with Kabompo, Mwinilunga, Kasempa, Chavuma, Zambezi and Mufumbwe districts.', image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=500&fit=crop&auto=format' },
    { name: 'Esther Mushinge', position: 'Deputy Secretary', description: 'Assist provincial administration and ensure efficient coordination with all North-Western Province district secretaries.', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&auto=format' },
    { name: 'Francis Chileshe', position: 'Treasurer General', description: 'Oversee all North-Western Province financial management and support provincial fundraising in the country\'s mineral-rich west.', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&auto=format' },
    { name: 'Doris Kawana', position: 'Deputy Treasurer', description: 'Support the Treasurer General and monitor financial activities across North-Western Province\'s extensive districts.', image: 'https://images.unsplash.com/photo-1542190891-2093d38760f2?w=400&h=500&fit=crop&auto=format' },
    { name: 'Kingsley Yamba', position: 'Youth Leader', description: 'Engage youth across Solwezi, Mwinilunga, Kabompo, Kasempa, Chavuma, Zambezi and Mufumbwe on civic participation.', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&auto=format' },
    { name: 'Helena Kamwendo', position: 'Women Leader', description: 'Lead women\'s advocacy and empowerment initiatives across all North-Western Province communities.', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&auto=format' },
  ],
  'Northern Province': [
    { name: 'Moses Kasonde', position: 'Chairperson', description: 'Lead the Northern Provincial Executive Committee and represent the party across Kasama, Mbala, Mpulungu and surrounding Lake Tanganyika districts.', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop&auto=format' },
    { name: 'Beatrice Chanda', position: 'Deputy Chairperson', description: 'Support provincial leadership and oversee development initiatives across Northern Province\'s vast communities.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop&auto=format' },
    { name: 'Emmanuel Zulu', position: 'Secretary', description: 'Manage provincial administration from Kasama and coordinate with Mbala, Mpulungu, Luwingu, Mungwi and Chilubi district secretaries.', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop&auto=format' },
    { name: 'Agness Musumali', position: 'Deputy Secretary', description: 'Support Northern Province administration and assist in coordinating activities across its many rural districts.', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop&auto=format' },
    { name: 'Augustine Chileshe', position: 'Treasurer General', description: 'Manage all Northern Province party funds and ensure financial prudence and transparency across the province.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&auto=format' },
    { name: 'Judith Namwila', position: 'Deputy Treasurer', description: 'Support financial management and monitor district-level financial activities across Northern Province.', image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=500&fit=crop&auto=format' },
    { name: 'Leonard Mwanang\'onze', position: 'Youth Leader', description: 'Drive youth mobilisation and engagement across Kasama, Mbala, Mpulungu, Luwingu, Mungwi and Chilubi districts.', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop&auto=format' },
    { name: 'Scholastica Kabwe', position: 'Women Leader', description: 'Champion women\'s rights, political participation and gender equity across all Northern Province communities.', image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=500&fit=crop&auto=format' },
  ],
  'Southern Province': [
    { name: 'Herbert Simuusa', position: 'Chairperson', description: 'Lead the Southern Provincial Executive Committee representing the party across Livingstone, Choma, Monze, Mazabuka and surrounding districts.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&auto=format' },
    { name: 'Catherine Mwanza', position: 'Deputy Chairperson', description: 'Support provincial leadership and champion agricultural community programmes across Southern Province\'s farming heartland.', image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=500&fit=crop&auto=format' },
    { name: 'Simon Monde', position: 'Secretary', description: 'Coordinate administrative operations from Livingstone, liaising with Choma, Monze, Mazabuka, Gwembe, Namwala and Kalomo districts.', image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400&h=500&fit=crop&auto=format' },
    { name: 'Dorothy Habeenzu', position: 'Deputy Secretary', description: 'Assist in managing Southern Province administration and ensure smooth communication across all provincial district structures.', image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=500&fit=crop&auto=format' },
    { name: 'Mainza Chona', position: 'Treasurer General', description: 'Oversee all Southern Province party finances and coordinate fundraising efforts across Zambia\'s agricultural heartland.', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&auto=format' },
    { name: 'Mwamba Sikapizye', position: 'Deputy Treasurer', description: 'Support financial management and monitor district financial activities across Southern Province.', image: 'https://images.unsplash.com/photo-1502767089025-6572583495f9?w=400&h=500&fit=crop&auto=format' },
    { name: 'Nathan Hakainde', position: 'Youth Leader', description: 'Engage youth across Livingstone, Choma, Monze, Mazabuka, Gwembe and all Southern Province districts.', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=500&fit=crop&auto=format' },
    { name: 'Priscilla Mweetwa', position: 'Women Leader', description: 'Lead women\'s empowerment and gender advocacy programmes across all Southern Province communities.', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=500&fit=crop&auto=format' },
  ],
  'Western Province': [
    { name: 'Lukundo Imwiiko', position: 'Chairperson', description: 'Lead the Western Provincial Executive Committee and represent the party across Mongu, Senanga, Kaoma, Kalabo and the Barotse Floodplain districts.', image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=500&fit=crop&auto=format' },
    { name: 'Sindwa Mubiana', position: 'Deputy Chairperson', description: 'Support provincial leadership and champion community development programmes across Western Province\'s unique Lozi-speaking communities.', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=500&fit=crop&auto=format' },
    { name: 'Arnold Mukalula', position: 'Secretary', description: 'Manage provincial administration from Mongu, coordinating with Senanga, Kaoma, Kalabo, Limulunga, Sikongo and Luampa districts.', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop&auto=format' },
    { name: 'Patricia Mwenda', position: 'Deputy Secretary', description: 'Assist in Western Province administration and support coordination across the province\'s geographically dispersed districts.', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&auto=format' },
    { name: 'Godwin Mbikusita', position: 'Treasurer General', description: 'Oversee Western Province party finances and coordinate fundraising across the flood-plain communities and upland districts.', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&auto=format' },
    { name: 'Cynthia Sinyinda', position: 'Deputy Treasurer', description: 'Support the Treasurer General and monitor financial activities across all Western Province district structures.', image: 'https://images.unsplash.com/photo-1542190891-2093d38760f2?w=400&h=500&fit=crop&auto=format' },
    { name: 'Silumesi Mwanawina', position: 'Youth Leader', description: 'Drive youth engagement across Mongu, Senanga, Kaoma, Kalabo, Limulunga and all Western Province districts.', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&auto=format' },
    { name: 'Mwangala Lewanika', position: 'Women Leader', description: 'Champion women\'s rights, political participation and empowerment across all Western Province communities.', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&auto=format' },
  ],
};

const ZAMBIA_DISTRICTS: Record<ZambiaProvince, string[]> = {
  'Central Province':       ['Chibombo','Chitambo','Itezhi-Tezhi','Kabwe','Kapiri Mposhi','Mkushi','Mumbwa','Ngabwe','Serenje','Shibuyunji'],
  'Copperbelt Province':    ['Chililabombwe','Chingola','Kalulushi','Kitwe','Luanshya','Lufwanyama','Masaiti','Mpongwe','Mufulira','Ndola'],
  'Eastern Province':       ['Chadiza','Chama','Chipangali','Chipata','Kasenengwa','Katete','Lumezi','Lundazi','Mambwe','Nyimba','Petauke'],
  'Luapula Province':       ['Bahati','Chembe','Chienge','Chipili','Kawambwa','Lunga','Mansa','Milenge','Mwanse','Mwansabombwe','Nchelenge','Samfya'],
  'Lusaka Province':        ['Chilanga','Chongwe','Kafue','Luangwa','Lusaka','Rufunsa','Shibuyunji'],
  'Muchinga Province':      ['Chinsali','Isoka','Kanchibiya','Lavushi Manda','Mafinga','Mpika','Nakonde',"Shiwang'andu"],
  'North-Western Province': ['Chavuma','Ikelenge','Kabompo','Kalumbila','Kasempa','Manyinga','Mufumbwe','Mushindamo','Mwinilunga','Ntambu','Solwezi','Zambezi'],
  'Northern Province':      ['Chilubi','Chishimba','Kaputa','Kasama','Lunte','Luwingu','Malole','Mbala','Mporokoso','Mpulungu','Mungwi','Nsama','Senga Hill','Nakonde'],
  'Southern Province':      ['Choma','Gwembe','Itezhi-Tezhi','Kalomo','Kazungula','Livingstone','Mazabuka','Monze','Namwala','Pemba','Siavonga','Sinazongwe','Zimba'],
  'Western Province':       ['Kalabo','Kaoma','Limulunga','Lukulu','Luampa','Mangango','Mitete','Mongu','Mulobezi','Mwandi','Nalolo','Nkeyema','Senanga','Shangombo','Sikongo','Sioma'],
};

const ALL_DISTRICTS_FLAT = ZAMBIA_PROVINCES.flatMap(p => ZAMBIA_DISTRICTS[p]);

// Name pools for deterministic leader generation
const M_FIRST = ['Chanda','Bwalya','Mutale','Luckson','Patrick','Richard','Samuel','Alfred','Bernard','Webster','Peter','George','Simon','Andrew','Jackson','Moses','David','Herbert','Emmanuel','Charles','Elias','Gabriel','Joshua','Daniel','Nathan','Oscar','Leonard','Francis','Augustine','Samson','Augustine','Arnold','Godwin','Mainza','Solomon','Lukundo'];
const F_FIRST = ['Bridget','Agnes','Charity','Faith','Doreen','Josephine','Natasha','Precious','Miriam','Dorothy','Gertrude','Beatrice','Lindiwe','Eunice','Mercy','Lucy','Stella','Mwamba','Patricia','Cynthia','Mwangala','Pauline','Catherine','Anastasia','Scholastica','Veronica','Grace','Helen','Judith','Sindwa'];
const SURNAMES = ['Mwape','Kasonde','Phiri','Zulu','Bwalya','Tembo','Lungu','Banda','Mulenga','Chanda','Nkonde','Musonda','Mutale','Chileshe','Mumba','Malama','Simumba','Kaoma','Mwanawasa','Sinkamba','Kafula','Mukalula','Mwenda','Simuusa','Mwanza','Monde','Habeenzu','Hamusonde','Mbikusita','Sinyinda','Lewanika','Imwiiko','Mubiana','Kasongo','Chona','Kawana','Yamba','Kamwendo','Namwila'];
const PHOTO_M = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=500&fit=crop&auto=format',
];
const PHOTO_F = [
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1542190891-2093d38760f2?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=500&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1502767089025-6572583495f9?w=400&h=500&fit=crop&auto=format',
];

function strHash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

function getDistrictLeaders(district: string): ProvinceLeader[] {
  const h = strHash(district);
  const pm = (arr: string[], offset: number) => arr[(h + offset * 7) % arr.length];
  const pf = (arr: string[], offset: number) => arr[(h + offset * 11 + 3) % arr.length];
  return [
    { name: `${pm(M_FIRST,0)} ${pm(SURNAMES,0)}`, position: 'Chairperson', description: `Preside over all ${district} District Executive Committee meetings. Represent the party in district-level political, civic, and government forums.`, image: pm(PHOTO_M, 0) },
    { name: `${pf(F_FIRST,0)} ${pf(SURNAMES,1)}`, position: 'Deputy Chairperson', description: `Assist the Chairperson in leading ${district} DEC structures. Oversee specific programmes and support coordination between DEC and branch leadership.`, image: pf(PHOTO_F, 0) },
    { name: `${pm(M_FIRST,1)} ${pm(SURNAMES,2)}`, position: 'Secretary', description: `Manage administrative operations of the ${district} district party structure. Record and distribute minutes, coordinate communication with branch secretaries.`, image: pm(PHOTO_M, 1) },
    { name: `${pf(F_FIRST,1)} ${pf(SURNAMES,3)}`, position: 'Deputy Secretary', description: `Assist the ${district} District Secretary in all administrative duties. Liaise with branch secretaries and monitor implementation of district resolutions.`, image: pf(PHOTO_F, 1) },
    { name: `${pm(M_FIRST,2)} ${pm(SURNAMES,4)}`, position: 'Treasurer', description: `Manage all ${district} district party funds and financial transactions. Prepare budgets, oversee fundraising, and provide oversight on branch financial activities.`, image: pm(PHOTO_M, 2) },
    { name: `${pf(F_FIRST,2)} ${pf(SURNAMES,5)}`, position: 'Deputy Treasurer', description: `Assist the ${district} District Treasurer in managing finances. Monitor branch-level financial activities and support audit processes.`, image: pf(PHOTO_F, 2) },
    { name: `${pm(M_FIRST,3)} ${pm(SURNAMES,6)}`, position: 'Youth Leader', description: `Coordinate youth activities and leadership development programs across all branches within ${district} district.`, image: pm(PHOTO_M, 3) },
    { name: `${pf(F_FIRST,3)} ${pf(SURNAMES,7)}`, position: 'Women Leader', description: `Lead women's empowerment initiatives and advocacy programs at the ${district} district level and across all branches.`, image: pf(PHOTO_F, 3) },
  ];
}

function LeadershipAccordion() {
  const [openSection, setOpenSection] = useState<string | null>('national');
  const [selectedProvince, setSelectedProvince] = useState<ZambiaProvince>('Lusaka Province');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Lusaka');
  const [backendNationals, setBackendNationals] = useState<Leader[]>([]);

  useEffect(() => {
    leadershipApi.list({ tier: 'national' })
      .then(res => { if (res.leaders.length > 0) setBackendNationals(res.leaders); })
      .catch(() => {});
  }, []);

  // Branch cascading selectors
  const [branchProvince, setBranchProvince] = useState<string>(ZAMBIA_HIERARCHY[4].name); // Lusaka
  const [branchDistrict, setBranchDistrict] = useState<string>('');
  const [branchConstituency, setBranchConstituency] = useState<string>('');
  const [branchWard, setBranchWard] = useState<string>('');

  const branchDistricts = useMemo(() => getDistricts(branchProvince), [branchProvince]);
  const branchConstituencies = useMemo(
    () => (branchDistrict ? getConstituencies(branchProvince, branchDistrict) : []),
    [branchProvince, branchDistrict],
  );
  const branchWards = useMemo(
    () => (branchConstituency ? getWards(branchProvince, branchDistrict, branchConstituency) : []),
    [branchProvince, branchDistrict, branchConstituency],
  );
  const branchLeaders = useMemo(
    () => (branchWard ? getBranchLeaders(branchWard) : []),
    [branchWard],
  );

  const selectedWardObj = useMemo(
    () => branchWards.find(w => w.id === branchWard),
    [branchWards, branchWard],
  );

  // Resolve national leaders: backend data if available, else hardcoded fallback
  const nationalLeaders = backendNationals.length > 0
    ? backendNationals.filter(l => l.active).map(l => ({
        name: l.name,
        position: l.position,
        description: l.description,
        image: l.hasCustomImage ? leadershipApi.imageUrl(l.id) : (l.imageUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop&auto=format'),
      }))
    : FALLBACK_NATIONAL.map(l => ({
        name: l.name!,
        position: l.position!,
        description: l.description!,
        image: (l as { _localImg?: string })._localImg || l.imageUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop&auto=format',
        whiteBg: (l as { whiteBg?: boolean }).whiteBg,
        redacted: (l as { redacted?: boolean }).redacted ?? false,
      }));

  const leadershipLevels = [
    {
      id: 'national',
      title: 'National Leadership',
      description: 'The National Leadership constitutes the highest governing body of the party. These officials are elected at the National Conference and are collectively responsible for the overall strategic direction, policy formulation, and governance of the organisation at a national level.',
      leaders: nationalLeaders,
    },
    {
      id: 'provincial',
      title: 'Provincial Leadership',
      description: 'The Provincial Leadership is responsible for driving the party\'s mandate within a specific province. These officials are elected at the Provincial Conference and work to implement national resolutions while responding to the unique political and social dynamics of their province.',
      leaders: PROVINCIAL_LEADERS[selectedProvince],
    },
    {
      id: 'district',
      title: 'District Leadership',
      description: 'The District Leadership coordinates party activities across branches within a defined district. These officials bridge the gap between provincial leadership and branch structures, ensuring effective implementation of programmes and growth of the party at the local government level.',
      leaders: getDistrictLeaders(selectedDistrict),
    },
    {
      id: 'branch',
      title: 'Branch Leadership',
      description: 'The Branch Leadership is the most grassroots tier of the party. Each of Zambia\'s 1,858 wards has its own Branch with elected officials who are the direct interface between the party and the community. Select your ward below to view its leadership.',
      leaders: branchLeaders,
    },
  ];

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="space-y-8">
      {leadershipLevels.map((level) => {
        const isOpen = openSection === level.id;
        return (
          <div key={level.id}>
            {/* Section Header */}
            <button
              onClick={() => toggleSection(level.id)}
              className="w-full mb-6 px-6 py-5 flex items-center justify-between text-left transition-all"
              style={{
                backgroundColor: '#111',
                border: '1px solid #1f1f1f',
              }}
            >
              <div>
                <h3
                  className="text-white mb-1"
                  style={{
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: '1.5rem',
                    letterSpacing: '0.06em',
                    color: isOpen ? '#dc2626' : '#fff',
                  }}
                >
                  {level.title}
                </h3>
                <p
                  style={{
                    color: '#9ca3af',
                    fontSize: '14px',
                    lineHeight: 1.6,
                  }}
                >
                  {level.description}
                </p>
              </div>
              <ChevronDown
                className={`w-6 h-6 transition-transform duration-300 shrink-0 ml-4 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                style={{ color: '#dc2626' }}
              />
            </button>

            {/* Leaders Grid */}
            <div
              className="overflow-hidden transition-all duration-500"
              style={{
                maxHeight: isOpen ? '3000px' : '0',
                opacity: isOpen ? 1 : 0,
              }}
            >
              {/* Province selector — only shown for the provincial section */}
              {level.id === 'provincial' && (
                <div className="mb-8">
                  <p className="mb-3 text-xs uppercase tracking-widest" style={{ color: '#dc2626', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.2em' }}>
                    Select Province
                  </p>
                  <div className="relative inline-block w-full max-w-sm">
                    <select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value as ZambiaProvince)}
                      className="w-full appearance-none px-5 py-3 pr-12 text-white cursor-pointer outline-none"
                      style={{
                        backgroundColor: '#111',
                        border: '1px solid #dc2626',
                        fontFamily: 'Oswald, sans-serif',
                        fontSize: '1rem',
                        letterSpacing: '0.06em',
                        color: '#fff',
                      }}
                    >
                      {ZAMBIA_PROVINCES.map((prov) => (
                        <option key={prov} value={prov} style={{ backgroundColor: '#111', color: '#fff' }}>
                          {prov}
                        </option>
                      ))}
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4" style={{ backgroundColor: '#dc2626' }}>
                      <ChevronDown className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 mb-6 h-px" style={{ backgroundColor: '#1f1f1f' }} />
                  <p className="text-sm" style={{ color: '#6b7280', fontStyle: 'italic' }}>
                    Showing leadership for <span style={{ color: '#fff' }}>{selectedProvince}</span>
                  </p>
                </div>
              )}

              {/* District selector */}
              {level.id === 'district' && (
                <div className="mb-8">
                  <p className="mb-3 text-xs uppercase tracking-widest" style={{ color: '#dc2626', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.2em' }}>
                    Select District
                  </p>
                  <div className="relative inline-block w-full max-w-sm">
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full appearance-none px-5 py-3 pr-12 cursor-pointer outline-none"
                      style={{
                        backgroundColor: '#111',
                        border: '1px solid #dc2626',
                        fontFamily: 'Oswald, sans-serif',
                        fontSize: '1rem',
                        letterSpacing: '0.06em',
                        color: '#fff',
                      }}
                    >
                      {ZAMBIA_PROVINCES.map((prov) => (
                        <optgroup key={prov} label={prov} style={{ backgroundColor: '#1a1a1a', color: '#dc2626', fontFamily: 'Oswald, sans-serif' }}>
                          {ZAMBIA_DISTRICTS[prov].map((dist) => (
                            <option key={dist} value={dist} style={{ backgroundColor: '#111', color: '#fff' }}>
                              {dist}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4" style={{ backgroundColor: '#dc2626' }}>
                      <ChevronDown className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 mb-6 h-px" style={{ backgroundColor: '#1f1f1f' }} />
                  <p className="text-sm" style={{ color: '#6b7280', fontStyle: 'italic' }}>
                    Showing leadership for <span style={{ color: '#fff' }}>{selectedDistrict} District</span>
                  </p>
                </div>
              )}

              {/* Branch cascading selectors */}
              {level.id === 'branch' && (
                <div className="mb-8">
                  <p className="mb-4 text-xs uppercase tracking-widest" style={{ color: '#dc2626', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.2em' }}>
                    Select Your Ward
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Province */}
                    <div>
                      <label className="block mb-2 text-xs uppercase tracking-wider" style={{ color: '#6b7280', fontFamily: 'Oswald, sans-serif' }}>
                        1. Province
                      </label>
                      <div className="relative">
                        <select
                          value={branchProvince}
                          onChange={(e) => {
                            setBranchProvince(e.target.value);
                            setBranchDistrict('');
                            setBranchConstituency('');
                            setBranchWard('');
                          }}
                          className="w-full appearance-none px-4 py-3 pr-10 cursor-pointer outline-none"
                          style={{ backgroundColor: '#111', border: '1px solid #dc2626', fontFamily: 'Oswald, sans-serif', fontSize: '0.9rem', color: '#fff' }}
                        >
                          {ZAMBIA_HIERARCHY.map(p => (
                            <option key={p.name} value={p.name} style={{ backgroundColor: '#111' }}>{p.name}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3" style={{ backgroundColor: '#dc2626' }}>
                          <ChevronDown className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* District */}
                    <div>
                      <label className="block mb-2 text-xs uppercase tracking-wider" style={{ color: '#6b7280', fontFamily: 'Oswald, sans-serif' }}>
                        2. District
                      </label>
                      <div className="relative">
                        <select
                          value={branchDistrict}
                          onChange={(e) => {
                            setBranchDistrict(e.target.value);
                            setBranchConstituency('');
                            setBranchWard('');
                          }}
                          disabled={!branchProvince}
                          className="w-full appearance-none px-4 py-3 pr-10 cursor-pointer outline-none disabled:opacity-40"
                          style={{ backgroundColor: '#111', border: `1px solid ${branchDistrict ? '#dc2626' : '#333'}`, fontFamily: 'Oswald, sans-serif', fontSize: '0.9rem', color: '#fff' }}
                        >
                          <option value="" style={{ backgroundColor: '#111' }}>— Select District —</option>
                          {branchDistricts.map(d => (
                            <option key={d.name} value={d.name} style={{ backgroundColor: '#111' }}>{d.name}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3" style={{ backgroundColor: branchDistrict ? '#dc2626' : '#222' }}>
                          <ChevronDown className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Constituency */}
                    <div>
                      <label className="block mb-2 text-xs uppercase tracking-wider" style={{ color: '#6b7280', fontFamily: 'Oswald, sans-serif' }}>
                        3. Constituency
                      </label>
                      <div className="relative">
                        <select
                          value={branchConstituency}
                          onChange={(e) => {
                            setBranchConstituency(e.target.value);
                            setBranchWard('');
                          }}
                          disabled={!branchDistrict}
                          className="w-full appearance-none px-4 py-3 pr-10 cursor-pointer outline-none disabled:opacity-40"
                          style={{ backgroundColor: '#111', border: `1px solid ${branchConstituency ? '#dc2626' : '#333'}`, fontFamily: 'Oswald, sans-serif', fontSize: '0.9rem', color: '#fff' }}
                        >
                          <option value="" style={{ backgroundColor: '#111' }}>— Select Constituency —</option>
                          {branchConstituencies.map(c => (
                            <option key={c.id} value={c.id} style={{ backgroundColor: '#111' }}>{c.name}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3" style={{ backgroundColor: branchConstituency ? '#dc2626' : '#222' }}>
                          <ChevronDown className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Ward */}
                    <div>
                      <label className="block mb-2 text-xs uppercase tracking-wider" style={{ color: '#6b7280', fontFamily: 'Oswald, sans-serif' }}>
                        4. Ward
                      </label>
                      <div className="relative">
                        <select
                          value={branchWard}
                          onChange={(e) => setBranchWard(e.target.value)}
                          disabled={!branchConstituency}
                          className="w-full appearance-none px-4 py-3 pr-10 cursor-pointer outline-none disabled:opacity-40"
                          style={{ backgroundColor: '#111', border: `1px solid ${branchWard ? '#dc2626' : '#333'}`, fontFamily: 'Oswald, sans-serif', fontSize: '0.9rem', color: '#fff' }}
                        >
                          <option value="" style={{ backgroundColor: '#111' }}>— Select Ward —</option>
                          {branchWards.map(w => (
                            <option key={w.id} value={w.id} style={{ backgroundColor: '#111' }}>{w.name}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3" style={{ backgroundColor: branchWard ? '#dc2626' : '#222' }}>
                          <ChevronDown className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 h-px" style={{ backgroundColor: '#1f1f1f' }} />

                  {branchWard && selectedWardObj ? (
                    <p className="text-sm" style={{ color: '#6b7280', fontStyle: 'italic' }}>
                      Showing Branch Leadership for{' '}
                      <span style={{ color: '#fff' }}>{selectedWardObj.name}</span>
                      {' '}—{' '}
                      <span style={{ color: '#9ca3af' }}>{selectedWardObj.constituencyName} Constituency, {selectedWardObj.districtName} District, {selectedWardObj.provinceName}</span>
                    </p>
                  ) : (
                    <p className="text-sm" style={{ color: '#6b7280', fontStyle: 'italic' }}>
                      Select a province, district, constituency, and ward to view that branch's elected leadership.
                    </p>
                  )}
                </div>
              )}

              {level.id === 'branch' ? (
                !branchWard ? (
                  <div className="flex flex-col items-center justify-center py-16 pb-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                      <ChevronDown className="w-8 h-8" style={{ color: '#dc2626' }} />
                    </div>
                    <p style={{ color: '#6b7280', fontFamily: 'Oswald, sans-serif', fontSize: '1rem', letterSpacing: '0.06em' }}>
                      Select a ward to view its branch leadership
                    </p>
                    <p className="mt-2 text-sm" style={{ color: '#4b5563' }}>
                      10 Provinces · 116 Districts · 226 Constituencies · 1,858 Wards
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
                    {branchLeaders.map((leader) => (
                      <LeaderCard key={`branch-${leader.position}-${branchWard}`} leader={leader} />
                    ))}
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
                  {level.leaders.map((leader) => (
                    <LeaderCard key={`${level.id}-${leader.position}-${level.id === 'provincial' ? selectedProvince : selectedDistrict}`} leader={leader} />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Hardcoded fallback national leaders — all images now displayed
const FALLBACK_NATIONAL = [
  { id: 'f1', name: 'Vincent Kafula',        position: 'Presidential Candidate',  description: 'Founder and Presidential Candidate of Build One Zambia. Vincent leads the movement with a vision of infrastructure-led development and inclusive growth for every Zambian.', imageUrl: '', hasCustomImage: false, _localImg: vincentKafulaLeaderPhoto, whiteBg: true,  redacted: false },
  { id: 'f2', name: 'Mukubesa Mundia',       position: 'Deputy President',        description: 'Assist the President in executing the strategic mandate of the party and coordinating national leadership activities.', imageUrl: '', hasCustomImage: false, _localImg: mukubesaMundia,        redacted: false },
  { id: 'f3', name: 'Mulaza Kaira',          position: 'Secretary General',       description: 'Manage the day-to-day administrative operations of the party and ensure the effective implementation of all party decisions.', imageUrl: '', hasCustomImage: false, _localImg: mulazaKaira,              redacted: false },
  { id: 'f4', name: 'Scart Chansa Kantanta', position: 'Deputy Secretary General',description: 'Assist the Secretary General in managing party administration and coordinate inter-provincial communication.', imageUrl: '', hasCustomImage: false, _localImg: scartChansa,              redacted: false },
  { id: 'f5', name: 'Gary Nkombo',           position: 'Chairperson',             description: 'Preside over all NEC and General Council meetings and provide strategic oversight of party governance.', imageUrl: '', hasCustomImage: false, _localImg: garyNkombo,                   redacted: false },
  { id: 'f6', name: 'Willah Mudolo',         position: 'Deputy Chairperson',      description: 'Act as Chairperson in his absence and assist in coordinating party meetings and governance activities.', imageUrl: '', hasCustomImage: false, _localImg: willahMudolo,                                       redacted: false },
  { id: 'f7', name: 'Christopher Kang\'ombe',position: 'Treasurer General',       description: 'Oversee financial management of all national party funds and ensure fiscal accountability and transparency.', imageUrl: '', hasCustomImage: false, _localImg: christopherKangombe,      redacted: false },
  { id: 'f8', name: 'Joseph Kalimbwe',       position: 'Deputy Treasurer General',description: 'Assist the Treasurer General in managing national finances and ensure proper record-keeping across all provinces.', imageUrl: '', hasCustomImage: false, _localImg: josephKalimbwe,           redacted: false },
] as (Partial<Leader> & { _localImg?: string })[];

export function AboutPage() {
  const location = useLocation();

  useEffect(() => {
    if (location?.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [location?.hash]);

  return (
    <div style={{ backgroundColor: '#007A30', fontFamily: 'Open Sans, sans-serif', color: '#fff' }}>

      {/* Hero */}
      <section className="relative py-28 px-4 text-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #007A30 0%, #006B28 40%, #1a0000 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 40%, #dc2626 0%, transparent 60%)' }} />
        <div className="relative max-w-4xl mx-auto">
          <SectionLabel text="WHO WE ARE" />
          <h1 className="mb-6" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1, letterSpacing: '0.03em' }}>
            ABOUT <span style={{ color: '#dc2626' }}>BUILD ONE ZAMBIA</span>
          </h1>
          <p className="max-w-2xl mx-auto" style={{ color: '#9ca3af', fontSize: '1.1rem', lineHeight: 1.8 }}>
            A national movement rooted in the belief that Zambians have everything it takes to transform this country.
          </p>
        </div>
      </section>

      {/* Building a Better Future Together */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionLabel text="OUR FOUNDATION" />
            <H2>Building a Better Future Together</H2>
            <BodyText className="mb-5">
              At the heart of Build One Zambia is a simple, powerful conviction: when our people work together, there is nothing we cannot achieve.
            </BodyText>
            <BodyText className="mb-5">
              Our leadership is committed to listening — especially to Zambia's youth, the generation that will shape tomorrow. We are dedicated to understanding their needs, amplifying their ideas, and connecting them with experienced leaders who can help turn vision into reality. By bridging the gap between young Zambians and established decision-makers, we aim to empower the next generation to live meaningful lives and drive lasting, positive change across every corner of our nation.
            </BodyText>
            <BodyText>
              True progress demands genuine collaboration between youth and seasoned leaders. That partnership is the key to unlocking Zambia's enormous potential and securing a brighter, more prosperous future for every citizen.
            </BodyText>
          </div>
          <div className="relative overflow-hidden" style={{ height: '480px' }}>
            <ImageWithFallback
              src={COMMUNITY_IMG}
              alt="Zambian community gathering"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.2) 0%, transparent 60%)' }} />
            <div className="absolute -bottom-4 -left-4 w-40 h-40 -z-10" style={{ backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)' }} />
          </div>
        </div>
      </section>

      {/* Taking the First Step */}
      <section className="py-24 px-4" style={{ backgroundColor: '#0d0d0d' }}>
        <div className="max-w-4xl mx-auto">
          <SectionLabel text="OUR STRATEGY" />
          <H2>Taking the First Step</H2>
          <BodyText className="mb-5">
            Every great journey begins with a single, deliberate step. Ours starts here.
          </BodyText>
          <Blockquote>
            We begin with small, strategic steps — changes that may appear modest but will leave a profound impact on the future of our country.
          </Blockquote>
          <BodyText className="mb-5">
            Zambia's public debt currently stands at approximately USD 28.9 billion. Addressing this burden sustainably demands a disciplined and strategic approach: borrowing only for productive investments that generate export revenue and improve the lives of ordinary Zambians — never for consumption or private contracts.
          </BodyText>
          <BodyText className="mb-4">Our debt strategy focuses on targeted, asset-based borrowing that builds real national capacity:</BodyText>
          <BulletList items={[
            'Agricultural equipment to empower small-scale farmers, boost food security, and grow agricultural exports.',
            'Road construction equipment to strengthen municipal infrastructure and eliminate the tender system that has enabled corruption and the misuse of public funds.',
            'Housing construction equipment to accelerate the delivery of affordable homes in our rapidly growing cities.',
          ]} />
          <BodyText className="mt-4">
            By prioritising productive assets over consumable spending, we will catalyse self-sustaining economic growth, create dignified employment, and break the cycle of unsustainable debt.
          </BodyText>
        </div>
      </section>

      {/* Our Path Forward */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative overflow-hidden" style={{ height: '420px' }}>
            <ImageWithFallback
              src={YOUTH_IMG}
              alt="Zambian youth learning"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
          </div>
          <div>
            <SectionLabel text="THE ROAD AHEAD" />
            <H2>Our Path Forward</H2>
            <BodyText className="mb-5">
              Realising this vision requires experienced politicians, skilled professionals, and dedicated leaders capable of driving genuine economic transformation and infrastructure development. We are committed to assembling the expertise needed to deliver the results Zambia urgently deserves.
            </BodyText>
            <BodyText className="mb-5">
              Together — youth, leaders, and communities — we are taking meaningful action today to secure a thriving, equitable tomorrow for our nation.
            </BodyText>
            <Blockquote>Join us. The future of Zambia starts now.</Blockquote>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section id="leadership" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionLabel text="OUR LEADERSHIP" />
          <H2>Leadership</H2>
          <BodyText className="mb-10">
            Build One Zambia is led by dedicated leaders at every level — from national to branch — working together to bring our vision to life across the country.
          </BodyText>

          <LeadershipAccordion />
        </div>
      </section>

      {/* Membership */}
      <section className="py-24 px-4" style={{ backgroundColor: '#0d0d0d' }}>
        <div className="max-w-4xl mx-auto">
          <SectionLabel text="GET INVOLVED" />
          <H2>Membership</H2>
          <BodyText className="mb-10">
            Membership of Build One Zambia (BOZ) is open to every Zambian aged 18 years or older, regardless of tribe, race, colour, or creed — to all who accept our principles, policies, and programmes.
          </BodyText>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                heading: 'Aims',
                content: 'To build a united, non-tribal, non-racial, non-sexist, and democratic society.',
              },
              {
                heading: 'Objectives',
                content: 'To uplift the quality of life of all Zambians, with a particular focus on the poorest and most vulnerable.',
              },
              {
                heading: 'Our Policy',
                content: 'The Constitution of Zambia remains the foundational policy document of Build One Zambia.',
              },
            ].map(item => (
              <div key={item.heading} className="p-7" style={{ backgroundColor: '#111', border: '1px solid #1f1f1f' }}>
                <h3 className="mb-3 text-white" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', letterSpacing: '0.06em', color: '#dc2626' }}>{item.heading}</h3>
                <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.8 }}>{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Symbol of BOZ */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionLabel text="OUR IDENTITY" />
          <H2>The Symbol of Build One Zambia</H2>
          <BodyText className="mb-5">
            The emblem of Build One Zambia is a powerful declaration of unity, freedom, and shared progress for all Zambians. Its circular design is divided into green and orange halves, each representing a pillar of our national mission.
          </BodyText>
          <BodyText className="mb-5">
            At its centre, three icons speak to our development agenda: an excavator for construction and infrastructure; industrial buildings for manufacturing and economic growth; and a tractor for agriculture and food security. Together, these symbols embody BOZ's commitment to a modern, self-sufficient Zambia — built through collective effort across the sectors that uplift every community.
          </BodyText>
          <BodyText className="mb-10">
            The flag of BOZ features three equal horizontal bands: black, green, and gold.
          </BodyText>

          <h3 className="mb-8 text-white" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.3rem', letterSpacing: '0.06em' }}>What the Colours Stand For</h3>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { colour: '#1a1a1a', name: 'Black', border: '#333', desc: 'Honours the resilient people of Zambia — the everyday citizens, workers, farmers, and young people who have faced hardship and fought tirelessly across generations for dignity, justice, and genuine freedom.' },
              { colour: '#14532d', name: 'Green', border: '#166534', desc: "Celebrates Zambia's rich land and natural fertility — the life-giving soil that has sustained our families for centuries, yet has too often been underutilised or exploited under past systems." },
              { colour: '#854d0e', name: 'Gold', border: '#92400e', desc: "Represents our country's vast mineral wealth — copper, emeralds, and other resources — as well as the broader natural riches of our nation. This wealth belongs to all Zambians, not to a privileged elite." },
            ].map(c => (
              <div key={c.name} className="p-6" style={{ backgroundColor: '#111', border: '1px solid #1f1f1f' }}>
                <div className="w-10 h-10 rounded-full mb-4" style={{ backgroundColor: c.colour, border: `2px solid ${c.border}` }} />
                <h4 className="mb-2 text-white font-bold" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>{c.name}</h4>
                <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.8 }}>{c.desc}</p>
              </div>
            ))}
          </div>

          <h3 className="mb-4 text-white" style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.3rem', letterSpacing: '0.06em' }}>The Meaning of Unity</h3>
          <BodyText className="mb-4">
            The interlocking halves of the emblem represent the coming together of Zambia's diverse communities — regardless of tribe, region, language, or background — in a shared pursuit of freedom, fairness, and national renewal. This design echoes historic movements for inclusive progress and reflects BOZ's unwavering commitment to non-tribal, people-centred politics.
          </BodyText>
          <Blockquote>
            The BOZ symbol is our promise, our identity, and our rallying cry: Build One Zambia — for the people, by the people.
          </Blockquote>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4" style={{ backgroundColor: '#dc2626' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="mb-4 text-white" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '0.03em' }}>
            Join us. The future of Zambia starts now.
          </h2>
          <p className="text-red-100 mb-8" style={{ fontSize: '15px' }}>Vote Build One Zambia — 14 August 2031</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 font-bold bg-white transition-all duration-200 hover:opacity-90"
            style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', letterSpacing: '0.1em', color: '#dc2626' }}
          >
            GET INVOLVED <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}

export { AboutPage as default };
