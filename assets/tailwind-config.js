// AX YOUR BODY 공용 디자인 토큰 (design/DESIGN-pinterest.md 기준)
// 간격은 Tailwind 기본 눈금 중 0·1·2·3·4·6·8·12·16(= 0·4·8·12·16·24·32·48·64px)만 쓴다.
tailwind.config = {
  theme: {
    borderRadius: { none: '0', sm: '8px', DEFAULT: '16px', md: '16px', lg: '32px', full: '9999px' },
    extend: {
      colors: {
        primary: '#e60023',
        'primary-pressed': '#cc001f',
        ink: '#000000',
        body: '#33332e',
        mute: '#62625b',
        ash: '#91918c',
        stone: '#c8c8c1',
        hairline: '#dadad3',
        secondary: '#e5e5e0',
        'secondary-pressed': '#c8c8c1',
        canvas: '#ffffff',
        soft: '#fbfbf9',
        card: '#f6f6f3',
        dark: '#262622',
        'success-deep': '#103c25',
        'success-pale': '#c7f0da',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', 'sans-serif'],
      },
      fontSize: {
        display: ['36px', { lineHeight: '44px', letterSpacing: '-1.2px', fontWeight: '700' }],
        title: ['28px', { lineHeight: '36px', letterSpacing: '-1.2px', fontWeight: '700' }],
        'title-sm': ['24px', { lineHeight: '32px', letterSpacing: '-0.8px', fontWeight: '700' }],
        heading: ['20px', { lineHeight: '28px', letterSpacing: '-0.4px', fontWeight: '600' }],
        'heading-sm': ['18px', { lineHeight: '26px', fontWeight: '600' }],
        body: ['16px', { lineHeight: '24px' }],
        'body-sm': ['14px', { lineHeight: '20px' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '500' }],
        button: ['14px', { lineHeight: '20px', fontWeight: '700' }],
      },
    },
  },
};
