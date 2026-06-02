import { useState, useCallback, useEffect } from 'react'

const BUTTONS = [
  // row 1
  [
    { label: 'DEG', id: 'mode', cls: 'fn' },
    { label: '2nd', id: '2nd', cls: 'fn' },
    { label: 'π', id: 'pi', cls: 'fn' },
    { label: 'e', id: 'euler', cls: 'fn' },
    { label: 'AC', id: 'ac', cls: 'clear' },
    { label: '⌫', id: 'del', cls: 'clear' },
    { label: '%', id: 'pct', cls: 'op' },
    { label: '÷', id: 'div', cls: 'op' },
  ],
  // row 2
  [
    { label: 'x²', id: 'sq', cls: 'fn', label2: 'x³' },
    { label: '√', id: 'sqrt', cls: 'fn', label2: '∛' },
    { label: 'xʸ', id: 'pow', cls: 'fn', label2: 'ʸ√x' },
    { label: '1/x', id: 'inv', cls: 'fn' },
    { label: '7', id: '7', cls: 'num' },
    { label: '8', id: '8', cls: 'num' },
    { label: '9', id: '9', cls: 'num' },
    { label: '×', id: 'mul', cls: 'op' },
  ],
  // row 3
  [
    { label: 'sin', id: 'sin', cls: 'fn', label2: 'sin⁻¹' },
    { label: 'cos', id: 'cos', cls: 'fn', label2: 'cos⁻¹' },
    { label: 'tan', id: 'tan', cls: 'fn', label2: 'tan⁻¹' },
    { label: 'n!', id: 'fact', cls: 'fn' },
    { label: '4', id: '4', cls: 'num' },
    { label: '5', id: '5', cls: 'num' },
    { label: '6', id: '6', cls: 'num' },
    { label: '−', id: 'sub', cls: 'op' },
  ],
  // row 4
  [
    { label: 'ln', id: 'ln', cls: 'fn', label2: 'eˣ' },
    { label: 'log', id: 'log', cls: 'fn', label2: '10ˣ' },
    { label: '(', id: 'lp', cls: 'fn' },
    { label: ')', id: 'rp', cls: 'fn' },
    { label: '1', id: '1', cls: 'num' },
    { label: '2', id: '2', cls: 'num' },
    { label: '3', id: '3', cls: 'num' },
    { label: '+', id: 'add', cls: 'op' },
  ],
  // row 5
  [
    { label: 'MR', id: 'mr', cls: 'fn' },
    { label: 'MS', id: 'ms', cls: 'fn' },
    { label: 'M+', id: 'mplus', cls: 'fn' },
    { label: 'M−', id: 'mminus', cls: 'fn' },
    { label: '+/−', id: 'neg', cls: 'num' },
    { label: '0', id: '0', cls: 'num wide' },
    { label: '.', id: 'dot', cls: 'num' },
    { label: '=', id: 'eq', cls: 'eq' },
  ],
]

function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) return NaN
  if (n > 170) return Infinity
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

function evaluate(expr) {
  try {
    // Replace display symbols with JS equivalents
    let e = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, '(' + Math.PI + ')')
      .replace(/e(?![0-9])/g, '(' + Math.E + ')')
    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + e + ')')()
    return result
  } catch {
    return 'Error'
  }
}

function fmt(val) {
  if (val === 'Error' || val === '') return val
  const n = Number(val)
  if (!isFinite(n)) return isNaN(n) ? 'Error' : n > 0 ? '∞' : '-∞'
  if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-10 && n !== 0)) {
    return n.toExponential(8).replace(/\.?0+e/, 'e')
  }
  const s = parseFloat(n.toPrecision(12)).toString()
  return s
}

export default function Calculadora() {
  const [expr, setExpr] = useState('')
  const [history, setHistory] = useState('')
  const [mem, setMem] = useState(0)
  const [is2nd, setIs2nd] = useState(false)
  const [isDeg, setIsDeg] = useState(true)
  const [justEvaled, setJustEvaled] = useState(false)

  const toRad = useCallback((x) => (isDeg ? (x * Math.PI) / 180 : x), [isDeg])
  const fromRad = useCallback((x) => (isDeg ? (x * 180) / Math.PI : x), [isDeg])

  const press = useCallback((id) => {
    const digits = ['0','1','2','3','4','5','6','7','8','9']
    const ops = ['add','sub','mul','div']
    const opSyms = { add: '+', sub: '−', mul: '×', div: '÷' }

    setExpr(prev => {
      let e = prev

      // If last action was = and user presses digit, reset
      if (justEvaled && (digits.includes(id) || id === 'pi' || id === 'euler')) {
        e = ''
        setJustEvaled(false)
      } else if (justEvaled && ops.includes(id)) {
        // continue with previous result
        setJustEvaled(false)
      } else {
        setJustEvaled(false)
      }

      if (digits.includes(id)) return e + id
      if (id === 'dot') {
        const parts = e.split(/[\+\−\×\÷\(\)]/)
        const last = parts[parts.length - 1]
        if (last.includes('.')) return e
        return e + '.'
      }

      if (ops.includes(id)) {
        if (e === '' && id === 'sub') return '−'
        if (e === '') return e
        // replace trailing operator
        const lastChar = e.slice(-1)
        if (['+','−','×','÷'].includes(lastChar)) return e.slice(0,-1) + opSyms[id]
        return e + opSyms[id]
      }

      if (id === 'pi') return e + 'π'
      if (id === 'euler') return e + 'e'
      if (id === 'lp') return e + '('
      if (id === 'rp') return e + ')'

      if (id === 'pct') {
        try {
          const val = evaluate(e)
          return fmt(val / 100)
        } catch { return e }
      }

      if (id === 'neg') {
        if (e === '' || e === '0') return '−'
        if (e.startsWith('−') && !e.slice(1).match(/[\+\−\×\÷]/)) return e.slice(1)
        return '−(' + e + ')'
      }

      if (id === 'sq') {
        if (is2nd) return e + '^3'
        return '(' + e + ')^2'
      }
      if (id === 'sqrt') {
        if (is2nd) {
          setIs2nd(false)
          return e + '^(1/3)'
        }
        return 'sqrt(' + e + ')'
      }
      if (id === 'pow') {
        if (is2nd) { setIs2nd(false); return e + '^(1/' }
        return e + '^'
      }
      if (id === 'inv') return '1/(' + e + ')'

      if (id === 'sin') {
        if (is2nd) { setIs2nd(false); return 'asin(' + e + ')' }
        return 'sin(' + e + ')'
      }
      if (id === 'cos') {
        if (is2nd) { setIs2nd(false); return 'acos(' + e + ')' }
        return 'cos(' + e + ')'
      }
      if (id === 'tan') {
        if (is2nd) { setIs2nd(false); return 'atan(' + e + ')' }
        return 'tan(' + e + ')'
      }
      if (id === 'fact') {
        try {
          const val = evaluate(e)
          return fmt(factorial(val))
        } catch { return e }
      }

      if (id === 'ln') {
        if (is2nd) { setIs2nd(false); return 'exp(' + e + ')' }
        return 'ln(' + e + ')'
      }
      if (id === 'log') {
        if (is2nd) { setIs2nd(false); return '10^(' + e + ')' }
        return 'log(' + e + ')'
      }

      if (id === 'mr') return e + fmt(mem)
      if (id === 'ms') { setMem(evaluate(e) || 0); return e }
      if (id === 'mplus') { setMem(m => m + (evaluate(e) || 0)); return e }
      if (id === 'mminus') { setMem(m => m - (evaluate(e) || 0)); return e }

      if (id === 'ac') { setHistory(''); setJustEvaled(false); return '' }
      if (id === 'del') return e.slice(0, -1)

      if (id === 'mode') {
        setIsDeg(d => !d)
        return e
      }
      if (id === '2nd') {
        setIs2nd(s => !s)
        return e
      }

      if (id === 'eq') {
        if (e === '') return e
        // resolve trig functions with degree/radian handling
        let evalExpr = e
          .replace(/sqrt\(([^)]+)\)/g, (_, x) => `Math.sqrt(${x})`)
          .replace(/sin\(([^)]+)\)/g, (_, x) => `Math.sin(${isDeg ? `(${x})*Math.PI/180` : x})`)
          .replace(/cos\(([^)]+)\)/g, (_, x) => `Math.cos(${isDeg ? `(${x})*Math.PI/180` : x})`)
          .replace(/tan\(([^)]+)\)/g, (_, x) => `Math.tan(${isDeg ? `(${x})*Math.PI/180` : x})`)
          .replace(/asin\(([^)]+)\)/g, (_, x) => `(${isDeg ? 180 / Math.PI : 1}*Math.asin(${x}))`)
          .replace(/acos\(([^)]+)\)/g, (_, x) => `(${isDeg ? 180 / Math.PI : 1}*Math.acos(${x}))`)
          .replace(/atan\(([^)]+)\)/g, (_, x) => `(${isDeg ? 180 / Math.PI : 1}*Math.atan(${x}))`)
          .replace(/ln\(([^)]+)\)/g, (_, x) => `Math.log(${x})`)
          .replace(/log\(([^)]+)\)/g, (_, x) => `Math.log10(${x})`)
          .replace(/exp\(([^)]+)\)/g, (_, x) => `Math.exp(${x})`)
          .replace(/10\^\(([^)]+)\)/g, (_, x) => `Math.pow(10,${x})`)
          .replace(/\(([^)]+)\)\^2/g, (_, x) => `Math.pow(${x},2)`)
          .replace(/\(([^)]+)\)\^3/g, (_, x) => `Math.pow(${x},3)`)
          .replace(/([^)]+)\^\(1\/([^)]+)\)/g, (_, b, r) => `Math.pow(${b},1/(${r}))`)
          .replace(/([^)^]+)\^([^)]+)/g, (_, b, r) => `Math.pow(${b},${r})`)
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/−/g, '-')
          .replace(/π/g, Math.PI)
          .replace(/(?<![a-zA-Z])e(?![a-zA-Z0-9\.])/g, Math.E)

        let result
        try {
          // eslint-disable-next-line no-new-func
          result = Function('"use strict"; return (' + evalExpr + ')')()
        } catch {
          result = 'Error'
        }

        const formatted = result === 'Error' ? 'Error' : fmt(result)
        setHistory(e + ' =')
        setJustEvaled(true)
        return formatted
      }

      return e
    })
  }, [is2nd, isDeg, justEvaled, mem])

  // Keyboard support
  useEffect(() => {
    const handler = (ev) => {
      const k = ev.key
      if (k >= '0' && k <= '9') press(k)
      else if (k === '.') press('dot')
      else if (k === '+') press('add')
      else if (k === '-') press('sub')
      else if (k === '*') press('mul')
      else if (k === '/') { ev.preventDefault(); press('div') }
      else if (k === 'Enter' || k === '=') press('eq')
      else if (k === 'Backspace') press('del')
      else if (k === 'Escape') press('ac')
      else if (k === '(') press('lp')
      else if (k === ')') press('rp')
      else if (k === '%') press('pct')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [press])

  const CLS = {
    fn: 'bg-slate-700 hover:bg-slate-600 text-cyan-300',
    clear: 'bg-slate-700 hover:bg-red-600 text-red-400 hover:text-white',
    op: 'bg-violet-700 hover:bg-violet-500 text-white',
    num: 'bg-slate-800 hover:bg-slate-700 text-white',
    eq: 'bg-violet-500 hover:bg-violet-400 text-white font-bold',
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 shadow-2xl ring-1 ring-slate-700/50 overflow-hidden">

        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/60 border-b border-slate-700/40">
          <span className="text-xs font-semibold text-violet-400 tracking-widest uppercase">Sci Calc</span>
          <div className="flex gap-3 text-xs text-slate-400">
            <span className={isDeg ? 'text-cyan-400 font-semibold' : ''}>DEG</span>
            <span className={!isDeg ? 'text-cyan-400 font-semibold' : ''}>RAD</span>
            {mem !== 0 && <span className="text-yellow-400 font-semibold">M</span>}
            {is2nd && <span className="text-orange-400 font-semibold">2nd</span>}
          </div>
        </div>

        {/* Display */}
        <div className="px-4 pt-4 pb-3 bg-slate-900 select-none">
          <div className="h-5 text-right text-xs text-slate-500 font-mono truncate">{history || ' '}</div>
          <div
            className="mt-1 text-right font-mono text-white leading-none overflow-x-auto"
            style={{ fontSize: expr.length > 16 ? '1.25rem' : expr.length > 10 ? '1.75rem' : '2.25rem' }}
          >
            {expr || '0'}
          </div>
        </div>

        {/* Buttons */}
        <div className="px-3 pb-4 pt-1 space-y-1.5">
          {BUTTONS.map((row, ri) => (
            <div key={ri} className="grid grid-cols-8 gap-1.5">
              {row.map((btn) => {
                const isWide = btn.cls?.includes('wide')
                const baseCls = btn.cls?.replace(' wide', '') || 'num'
                const color = CLS[baseCls] || CLS.num
                const displayLabel = is2nd && btn.label2 ? btn.label2 : btn.label
                return (
                  <button
                    key={btn.id}
                    onClick={() => press(btn.id)}
                    className={[
                      'rounded-xl text-sm font-medium transition-all duration-75 active:scale-95 select-none',
                      'h-10',
                      isWide ? 'col-span-2' : 'col-span-1',
                      color,
                    ].join(' ')}
                  >
                    {displayLabel}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
