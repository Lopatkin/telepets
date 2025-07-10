import stickImage from '../images/dwelling/furniture/stick.png';
import garbageImage from '../images/dwelling/furniture/garbage.png';
import berryImage from '../images/dwelling/furniture/berry.png';
import mushroomsImage from '../images/dwelling/furniture/mushrooms.png';
import boardImage from '../images/dwelling/furniture/board.png';
import chairImage from '../images/dwelling/furniture/chair.png';
import tableImage from '../images/dwelling/furniture/table.png';
import wardrobeImage from '../images/dwelling/furniture/wardrobe.png';
import sofaImage from '../images/dwelling/furniture/sofa.png';
import chestImage from '../images/dwelling/furniture/chest.png';
import firstAidKitImage from '../images/dwelling/furniture/first-aid-kit.png';
import bandageImage from '../images/dwelling/furniture/bandage.png';
import chocolateImage from '../images/dwelling/furniture/chocolate.png';
import cannedFoodImage from '../images/dwelling/furniture/canned-food.png';

export const furnitureMap = new Map([
  ['Палка', { key: 'stick', size: 67, image: stickImage }],
  ['Мусор', { key: 'garbage', size: 67, image: garbageImage }],
  ['Лесные ягоды', { key: 'berry', size: 50, image: berryImage }],
  ['Лесные грибы', { key: 'mushrooms', size: 50, image: mushroomsImage }],
  ['Доска', { key: 'board', size: 100, image: boardImage }],
  ['Стул', { key: 'chair', size: 100, image: chairImage }],
  ['Стол', { key: 'table', size: 200, image: tableImage }],
  ['Шкаф', { key: 'wardrobe', size: 200, image: wardrobeImage }],
  ['Кровать', { key: 'sofa', size: 200, image: sofaImage }],
  ['Тумба', { key: 'chest', size: 100, image: chestImage }],
  ['Аптечка', { key: 'firstAidKit', size: 50, image: firstAidKitImage }],
  ['Бинт', { key: 'bandage', size: 50, image: bandageImage }],
  ['Шоколадка', { key: 'chocolate', size: 50, image: chocolateImage }],
  ['Консервы', { key: 'cannedFood', size: 50, image: cannedFoodImage }],
]);