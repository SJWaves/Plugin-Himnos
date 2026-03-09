// Datos de los himnos
export interface Hymn {
  number: number;
  title: string;
  verses: string[];
}

export interface Hymnbook {
  name: string;
  hymns: Hymn[];
}

export const hymnbooks: Record<string, Hymnbook> = {
  celebremos_su_gloria: {
    name: "Celebremos Su Gloria",
    hymns: [
      {
        number: 1,
        title: "Santo, Santo, Santo",
        verses: [
          "Santo, santo, santo, Señor omnipotente\nSiempre el labio mío loores te dará",
          "Santo, santo, santo, te adoro reverente\nDios en tres personas, bendita Trinidad",
          "Santo, santo, santo, por más que estés velado\nE imposible sea tu gloria contemplar",
          "Santo tú eres solo, y nada hay a tu lado\nEn poder perfecto, pureza y caridad",
        ],
      },
      {
        number: 3,
        title: "Castillo Fuerte es Nuestro Dios",
        verses: [
          "Castillo fuerte es nuestro Dios\nDefensa y buen escudo",
          "Con su poder nos librará\nEn este trance agudo",
          "Con furia y con afán\nAcósanos Satán",
          "Por armas deja ver\nAstucia y gran poder",
          "Cual él no puede haber",
        ],
      },
      {
        number: 30,
        title: "Cristo Vive",
        verses: [
          "Cristo vive, fuera el llanto\nCantos de triunfo dad",
          "Cristo vive, sea nuestro canto\n¡Aleluya! en verdad",
          "Él, que por nosotros padeció\nY en la cruz su sangre derramó",
          "Hoy triunfante reina en gloria\n¡Aleluya! Él venció",
        ],
      },
      {
        number: 45,
        title: "Sublime Gracia",
        verses: [
          "Sublime gracia del Señor\nQue a un infeliz salvó",
          "Fui ciego mas hoy miro yo\nPerdido y Él me halló",
          "Su gracia me enseñó a temer\nMis dudas ahuyentó",
          "¡Oh cuán precioso fue a mi ser\nAl dar me Jesús perdón!",
          "En los peligros o aflicción\nQue yo he tenido aquí",
          "Su gracia siempre me libró\nY me guiará feliz",
        ],
      },
      {
        number: 112,
        title: "Gracia Admirable",
        verses: [
          "Gracia admirable de Jesús\nQue mi alma rescató",
          "Del mal camino me salvó\nY a Su redil me llamó",
          "Gracia admirable, ¡cuán dulce es!\nQue me salvó de la maldad",
          "Gracia admirable, siempre fiel\nEs Cristo mi Salvador",
        ],
      },
      {
        number: 150,
        title: "A Dios el Padre Celestial",
        verses: [
          "A Dios el Padre celestial\nYo quiero cantar",
          "Porque me ama con amor\nEterno y sin igual",
          "En Cristo me adoptó\nY heredero me llamó",
          "Por eso canto con fervor\nY a Él le doy mi amor",
        ],
      },
    ],
  },
  suplementario: {
    name: "Suplementario",
    hymns: [
      {
        number: 1,
        title: "A Jehová Cantaré",
        verses: [
          "A Jehová cantaré porque se ha magnificado grandemente\nEchó en el mar al caballo y al jinete",
          "Jehová es mi fortaleza y mi cántico\nHa sido mi salvación",
          "Este es mi Dios, le alabaré\nDios de mi padre, le enaltaceré",
        ],
      },
      {
        number: 15,
        title: "Tuyo Soy Jesús",
        verses: [
          "Tuyo soy Jesús, yo escuché tu voz\nCon tu gran amor me llamaste a mí",
          "No hay ya en este mundo nada que escoger\nSolo quiero amarte y seguirte a Ti",
          "Mi ser y mi vida están en Ti Señor\nHaz que siempre viva para tu honor",
          "Dame tus palabras de consolación\nY haz que de ti hable mi corazón",
        ],
      },
      {
        number: 25,
        title: "Tu Fidelidad",
        verses: [
          "Tu fidelidad es grande\nTu fidelidad incomparable es",
          "Nadie como Tú, bendito Dios\nGrande es tu fidelidad",
          "No cambian las estaciones\nSin que yo deje de ver",
          "Que tu mano providente\nMe cuida y sustenta en todo mi ser",
        ],
      },
    ],
  },
};

export function searchHymns(hymnbookId: string, query: string): Hymn[] {
  const hymnbook = hymnbooks[hymnbookId];
  if (!hymnbook) return [];

  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return hymnbook.hymns;

  return hymnbook.hymns.filter((hymn) => {
    const matchesNumber = hymn.number.toString().includes(normalizedQuery);
    const matchesTitle = hymn.title.toLowerCase().includes(normalizedQuery);
    return matchesNumber || matchesTitle;
  });
}
