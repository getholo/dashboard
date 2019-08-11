import generate from 'nanoid/generate';

export default () => +`7${generate('0123456789', 3)}`;
