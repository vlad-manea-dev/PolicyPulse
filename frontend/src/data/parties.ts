export interface Politician {
  name: string;
  role?: string;
}

export interface Party {
  id: string;
  name: string;
  color: string;
  logoText: string;
  logoUrl?: string;
  people: Politician[];
}

export const PARTIES: Party[] = [
  {
    id: "fianna-fail",
    name: "Fianna Fáil",
    color: "#4a773c",
    logoText: "FF",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Fianna_F%C3%A1il_logo_%282024%29.svg/500px-Fianna_F%C3%A1il_logo_%282024%29.svg.png",
    people: [
      { name: "Micheál Martin", role: "Tánaiste" },
      { name: "Jack Chambers", role: "Minister for Finance" },
      { name: "Mary Butler", role: "Minister of State" },
      { name: "Darragh O'Brien", role: "Minister for Housing" }
    ]
  },
  {
    id: "fine-gael",
    name: "Fine Gael",
    color: "#1e528d",
    logoText: "FG",
    logoUrl: "/assets/fg_logo.png",
    people: [
      { name: "Simon Harris", role: "Taoiseach" },
      { name: "Helen McEntee", role: "Minister for Justice" },
      { name: "Paschal Donohoe", role: "Minister" },
      { name: "Heather Humphreys", role: "Deputy Leader" }
    ]
  },
  {
    id: "sinn-fein",
    name: "Sinn Féin",
    color: "#287556",
    logoText: "SF",
    logoUrl: "/assets/sf_logo.png",
    people: [
      { name: "Mary Lou McDonald", role: "Party Leader" },
      { name: "Pearse Doherty", role: "Deputy Leader" },
      { name: "Eoin Ó Broin", role: "Housing Spokesperson" },
      { name: "Louise O'Reilly", role: "Enterprise Spokesperson" }
    ]
  },
  {
    id: "green-party",
    name: "Green Party",
    color: "#6b9e38",
    logoText: "GP",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Green_Party_%28Ireland%29_logo.svg/500px-Green_Party_%28Ireland%29_logo.svg.png",
    people: [
      { name: "Roderic O'Gorman", role: "Party Leader" },
      { name: "Catherine Martin", role: "Minister" },
      { name: "Ossian Smyth", role: "Minister of State" },
      { name: "Neasa Hourigan", role: "TD" }
    ]
  },
  {
    id: "labour",
    name: "Labour",
    color: "#b02a2a",
    logoText: "LAB",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/The_logo_of_Labour_Party_in_Ireland_2021.svg/500px-The_logo_of_Labour_Party_in_Ireland_2021.svg.png",
    people: [
      { name: "Ivana Bacik", role: "Party Leader" },
      { name: "Aodhán Ó Ríordáin", role: "TD" },
      { name: "Ged Nash", role: "TD" },
      { name: "Duncan Smith", role: "TD" }
    ]
  },
  {
    id: "social-democrats",
    name: "Social Democrats",
    color: "#5d326f",
    logoText: "SD",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Social_Democrats_%28Ireland%29_logo.svg/500px-Social_Democrats_%28Ireland%29_logo.svg.png",
    people: [
      { name: "Holly Cairns", role: "Party Leader" },
      { name: "Róisín Shortall", role: "TD" },
      { name: "Catherine Murphy", role: "TD" },
      { name: "Gary Gannon", role: "TD" }
    ]
  }
];
