export interface FacialExpressionInterface {
    'index': number,
    'mouth': {
        'a': number,
        'i': number,
        'u': number,
        'e': number,
        'o': number,
    },
    'eyelid': {
        'blink_l': number,
        'blink_r': number,
        'blink': number,
    },
    'look': {
        'lookdown': number,
        'lookup': number,
        'lookleft': number,
        'lookright': number,
    },
    'emotion':{
        'angry': number,
        'fun': number,
        'joy': number,
        'neutral': number,
        'sorrow': number,
        'unknown': number,
    }
}

export class FacialExpression {
    // value 0.0 - 1.0
    private _values: FacialExpressionInterface = {
        'index': 0,
        'mouth': {
            'a': 0.0,
            'i': 0.0,
            'u': 0.0,
            'e': 0.0,
            'o': 0.0,
        },
        'eyelid': {
            'blink_l': 0.0,
            'blink_r': 0.0,
            'blink': 0.0,
        },
        'look': {
            'lookdown': 0.0,
            'lookup': 0.0,
            'lookleft': 0.0,
            'lookright': 0.0,
        },
        'emotion':{
            'angry': 0.0,
            'fun': 0.0,
            'joy': 0.0,
            'neutral': 0.0,
            'sorrow': 0.0,
            'unknown': 0.0,
        }
    }

    constructor(index: number){
        this._values.index = index;
    }

    public setValues(src: FacialExpressionInterface) {
        this._values = src;
    }

    public get values(): FacialExpressionInterface {
        return this._values;
    }
}