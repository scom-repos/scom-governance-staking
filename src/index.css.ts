import { Styles } from '@ijstech/components';
const Theme = Styles.Theme.ThemeVars;

export default Styles.style({
  $nest: {
    '.custom-combobox .selection': {
      background: 'transparent',
      $nest: {
        'input': {
          background: 'transparent',
          color: '#fff'
        }
      }
    },
    'input': {
      background: 'transparent',
      color: '#fff'
    },
    '.custom-combobox .icon-btn': {
      background: 'transparent',
      border: 'none'
    },
    '.none-select': {
      userSelect: 'none'
    },
    '.custom-shadow': {
      boxShadow: '0 2px 8px rgb(0 0 0 / 15%)'
    },
    '.has-caret': {
      position: 'relative',
      $nest: {
        '&::before': {
          position: 'absolute',
          content: '""',
          top: -14,
          left: '50%',
          transform: 'translateX(-50%)',
          border: '7px solid transparent',
          borderBottomColor: Theme.background.modal,
          visibility: 'inherit'
        }
      }
    }
  }
})
