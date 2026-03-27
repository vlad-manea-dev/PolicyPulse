export interface Politician {
  name: string;
  role?: string;
  contradictionScore?: number; // 0–100, higher = more contradictions
}

export interface Party {
  id: string;
  name: string;
  color: string;
  logoText: string;
  logoUrl?: string;
  detailLogoUrl?: string; // transparent-bg version for the party detail page
  description: string;
  compass: { economic: number; social: number }; // economic: -10 (left) to +10 (right), social: -10 (libertarian) to +10 (authoritarian)
  people: Politician[];
}

export const PARTIES: Party[] = [
  {
    id: "fianna-fail",
    name: "Fianna Fáil",
    color: "#4a773c",
    logoText: "FF",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Fianna_F%C3%A1il_logo_%282024%29.svg/500px-Fianna_F%C3%A1il_logo_%282024%29.svg.png",
    description: "One of Ireland's two dominant centre-right parties, founded in 1926. Traditionally rooted in Irish republicanism, it has shifted to pragmatic centrism over decades in government, championing a mixed economy, rural Ireland, and EU membership.",
    compass: { economic: 2, social: 2 },
    people: [
      { name: "Micheál Martin", role: "Tánaiste", contradictionScore: 74 },
      { name: "Jack Chambers", role: "Minister for Finance", contradictionScore: 51 },
      { name: "Mary Butler", role: "Minister of State", contradictionScore: 38 },
      { name: "Darragh O'Brien", role: "Minister for Housing", contradictionScore: 82 }
    ]
  },
  {
    id: "fine-gael",
    name: "Fine Gael",
    color: "#1e528d",
    logoText: "FG",
    logoUrl: "/assets/fg_logo.png",
    detailLogoUrl: "/assets/fg_logo_nobg.png",
    description: "Ireland's largest centre-right party, tracing its roots to the pro-Treaty side of the 1922 Civil War. Fine Gael champions free-market economics, fiscal responsibility, and strong EU ties. It is seen as the establishment party of business and the professional middle class.",
    compass: { economic: 4, social: 1 },
    people: [
      { name: "Simon Harris", role: "Taoiseach", contradictionScore: 88 },
      { name: "Helen McEntee", role: "Minister for Justice", contradictionScore: 62 },
      { name: "Paschal Donohoe", role: "Minister", contradictionScore: 57 },
      { name: "Heather Humphreys", role: "Deputy Leader", contradictionScore: 43 }
    ]
  },
  {
    id: "sinn-fein",
    name: "Sinn Féin",
    color: "#287556",
    logoText: "SF",
    logoUrl: "/assets/sf_logo.png",
    detailLogoUrl: "/assets/sf_logo_nobg.png",
    description: "A left-wing republican party with roots in the Irish independence movement. Sinn Féin advocates for Irish unity, public housing, higher corporate taxes, and a strong welfare state. Its surge in recent elections was driven by young, urban voters frustrated with housing and the cost of living.",
    compass: { economic: -5, social: -1 },
    people: [
      { name: "Mary Lou McDonald", role: "Party Leader", contradictionScore: 66 },
      { name: "Pearse Doherty", role: "Deputy Leader", contradictionScore: 29 },
      { name: "Eoin Ó Broin", role: "Housing Spokesperson", contradictionScore: 34 },
      { name: "Louise O'Reilly", role: "Enterprise Spokesperson", contradictionScore: 41 }
    ]
  },
  {
    id: "green-party",
    name: "Green Party",
    color: "#6b9e38",
    logoText: "GP",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Green_Party_%28Ireland%29_logo.svg/500px-Green_Party_%28Ireland%29_logo.svg.png",
    description: "Places environmental sustainability at the core of its platform, pushing for ambitious climate action and a just transition away from fossil fuels. The Green Party entered government in 2020 and delivered the landmark Climate Action Act. Its policies appeal to urban, educated voters concerned about the climate crisis.",
    compass: { economic: -2, social: -4 },
    people: [
      { name: "Roderic O'Gorman", role: "Party Leader", contradictionScore: 55 },
      { name: "Catherine Martin", role: "Minister", contradictionScore: 47 },
      { name: "Ossian Smyth", role: "Minister of State", contradictionScore: 39 },
      { name: "Neasa Hourigan", role: "TD", contradictionScore: 22 }
    ]
  },
  {
    id: "labour",
    name: "Labour",
    color: "#b02a2a",
    logoText: "LAB",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/The_logo_of_Labour_Party_in_Ireland_2021.svg/500px-The_logo_of_Labour_Party_in_Ireland_2021.svg.png",
    description: "Ireland's oldest party and the traditional voice of the organised working class and trade union movement. Labour advocates for workers' rights, public services, and progressive taxation. It is rebuilding under Ivana Bacik after a collapse in support following the 2011–2016 austerity coalition.",
    compass: { economic: -4, social: -2 },
    people: [
      { name: "Ivana Bacik", role: "Party Leader", contradictionScore: 44 },
      { name: "Aodhán Ó Ríordáin", role: "TD", contradictionScore: 31 },
      { name: "Ged Nash", role: "TD", contradictionScore: 27 },
      { name: "Duncan Smith", role: "TD", contradictionScore: 19 }
    ]
  },
  {
    id: "social-democrats",
    name: "Social Democrats",
    color: "#5d326f",
    logoText: "SD",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Social_Democrats_%28Ireland%29_logo.svg/500px-Social_Democrats_%28Ireland%29_logo.svg.png",
    description: "Founded in 2015, the Social Democrats push for a Nordic-style model in Ireland — prioritising public investment in housing, healthcare, and education. They strongly support Dáil reform, transparency, and evidence-based policy. A credible third-party voice for reform-minded, urban voters.",
    compass: { economic: -4, social: -5 },
    people: [
      { name: "Holly Cairns", role: "Party Leader", contradictionScore: 18 },
      { name: "Róisín Shortall", role: "TD", contradictionScore: 24 },
      { name: "Catherine Murphy", role: "TD", contradictionScore: 21 },
      { name: "Gary Gannon", role: "TD", contradictionScore: 15 }
    ]
  }
];
