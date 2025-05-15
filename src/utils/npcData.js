import {
  isLovecParkTime,
  isLovecDachnyTime,
  isBabushkaTime,
  isIraKatyaTime,
  isZhannaTime
} from './npcUtils';
import npcDataCore from './npcDataCore';

// Импорты изображений NPC
import belochkaImg from '../images/npc_belochka.jpg';
import lovec1Img from '../images/npc_lovec_1.jpg';
import foxImg from '../images/npc_fox.jpg';
import ezhikImg from '../images/npc_ezhik.jpg';
import securityImg from '../images/npc_security.jpg';
import lovec2Img from '../images/npc_lovec_2.jpg';
import guardImg from '../images/npc_guard.jpg';
import babushka1Img from '../images/babushka_1.jpg';
import babushka2Img from '../images/babushka_2.jpg';
import babushka3Img from '../images/babushka_3.jpg';
import volonterIraImg from '../images/volonter_Ira.jpg';
import volonterKatyaImg from '../images/volonter_Katya.jpg';
import volonterZhannaImg from '../images/volonter_Zhanna.jpg';
import prodavecSvetaImg from '../images/prodavec_Sveta.jpg';
import lostDogImg from '../images/lost_dog_1.jpg';
import smallDogImg from '../images/small_dog_1.jpg';
import illDogImg from '../images/ill_dog_1.jpg';
import limpDogImg from '../images/limp_dog_1.jpg';
import sadDogImg from '../images/sad_dog_1.jpg';
import madDog1Img from '../images/mad_dog_1.jpg';
import madDog2Img from '../images/mad_dog_2.jpg';
import mouseImg from '../images/npc_mouse.jpg';
import wolfImg from '../images/npc_wolf.jpg';
import boarImg from '../images/npc_boar.jpg';
import bearImg from '../images/npc_bear.jpg';

// Маппинг userId к изображениям
const imageMap = {
  'npc_belochka': belochkaImg,
  'npc_lovec_park': lovec1Img,
  'npc_fox': foxImg,
  'npc_ezhik': ezhikImg,
  'npc_security': securityImg,
  'npc_lovec_dachny': lovec2Img,
  'npc_guard': guardImg,
  'npc_babushka_galya': babushka1Img,
  'npc_babushka_vera': babushka2Img,
  'npc_babushka_zina': babushka3Img,
  'npc_volonter_ira': volonterIraImg,
  'npc_volonter_katya': volonterKatyaImg,
  'npc_volonter_zhanna': volonterZhannaImg,
  'npc_prodavec_sveta': prodavecSvetaImg,
  'npc_lost_dog': lostDogImg,
  'npc_small_dog': smallDogImg,
  'npc_ill_dog': illDogImg,
  'npc_limp_dog': limpDogImg,
  'npc_sad_dog': sadDogImg,
  'npc_mad_dog_1': madDog1Img,
  'npc_mad_dog_2': madDog2Img,
  'npc_mouse': mouseImg,
  'npc_wolf': wolfImg,
  'npc_boar': boarImg,
  'npc_bear': bearImg
};

// Маппинг строковых условий к функциям
const conditionMap = {
  isLovecParkTime,
  isLovecDachnyTime,
  isBabushkaTime,
  isIraKatyaTime,
  isZhannaTime
};

// Создаём npcData с photoUrl для клиента
const npcData = Object.keys(npcDataCore).reduce((acc, room) => {
  acc[room] = npcDataCore[room].map(npc => ({
    ...npc,
    photoUrl: imageMap[npc.userId],
    condition: npc.condition ? conditionMap[npc.condition] : undefined // Используем conditionMap вместо eval
  }));
  return acc;
}, {});

// Функция для получения активных NPC в комнате
const getActiveNPCs = (room) => {
  const npcs = npcData[room] || [];
  return npcs.filter(npc => !npc.condition || npc.condition());
};

export { npcData, getActiveNPCs };