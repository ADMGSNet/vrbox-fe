/* eslint-disable quote-props */
import { ItalianRegion } from '@zxd/interfaces/italian-region.interface';
import { KeyValue } from '@zxd/interfaces/key-value.interface';

const _italianRegion: KeyValue<ItalianRegion> = {
  '01': { code: '01', name: `Piemonte` },
  '02': { code: '02', name: `Valle d'Aosta` },
  '03': { code: '03', name: `Lombardia` },
  '04': { code: '04', name: `Trentino - Alto Adige` },
  '05': { code: '05', name: `Veneto` },
  '06': { code: '06', name: `Friuli - Venezia Giulia` },
  '07': { code: '07', name: `Liguria` },
  '08': { code: '08', name: `Emilia - Romagna` },
  '09': { code: '09', name: `Toscana` },
  '10': { code: '10', name: `Umbria` },
  '11': { code: '11', name: `Marche` },
  '12': { code: '12', name: `Lazio` },
  '13': { code: '13', name: `Abruzzo` },
  '14': { code: '14', name: `Molise` },
  '15': { code: '15', name: `Campania` },
  '16': { code: '16', name: `Puglia` },
  '17': { code: '17', name: `Basilicata` },
  '18': { code: '18', name: `Calabria` },
  '19': { code: '19', name: `Sicilia` },
  '20': { code: '20', name: `Sardegna` },
};

export const MItalianRegion = new Map<string, ItalianRegion>(Object.entries(_italianRegion));
