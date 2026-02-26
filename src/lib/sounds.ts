import { Howl } from 'howler';

const sounds = {
  click: new Howl({
    src: ['https://actions.google.com/sounds/v1/buttons/button_click.ogg'],
    volume: 0.5,
    onloaderror: () => console.warn('Click sound failed to load'),
    onplayerror: () => console.warn('Click sound failed to play'),
  }),
  upload: new Howl({
    src: ['https://actions.google.com/sounds/v1/buttons/simple_button_confirm.ogg'],
    volume: 0.5,
    onloaderror: () => console.warn('Upload sound failed to load'),
    onplayerror: () => console.warn('Upload sound failed to play'),
  }),
  success: new Howl({
    src: ['https://actions.google.com/sounds/v1/cartoon/clink_clank.ogg'],
    volume: 0.6,
    onloaderror: () => console.warn('Success sound failed to load'),
    onplayerror: () => console.warn('Success sound failed to play'),
  }),
};

export type SoundType = keyof typeof sounds;

export const playSound = (type: SoundType) => {
  sounds[type].play();
};

