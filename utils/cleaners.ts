// ── Deduplicate AI responses ──
export function deduplicateText(text: string): string {
  if (!text) return ''
  let trimmed = text.trim()
  
  // 1. Detect exact halves duplication
  const len = trimmed.length
  if (len > 20) {
    const half = Math.floor(len / 2)
    const firstHalf = trimmed.substring(0, half).trim()
    const secondHalf = trimmed.substring(half).trim()
    if (firstHalf === secondHalf) {
      return firstHalf
    }
  }

  // 2. Detect header-based duplication
  const headers = [
    'Estrategia de Mejora (SIKAI Boost)',
    'Estrategia de Mejora',
    'SIKAI Boost',
    '# Estrategia de Mejora',
    '## Estrategia de Mejora',
    'SIKAI SOP',
    '# SIKAI SOP',
    '## SIKAI SOP',
    'Procedimiento Estándar de Trabajo',
    'Manual de Procedimiento',
    'Objetivo',
    '# Objetivo',
    '## Objetivo',
    'graph TD',
    'graph LR',
    'flowchart TD',
    'flowchart LR'
  ]
  
  for (const header of headers) {
    const escapedHeader = header.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    const regex = new RegExp(`(?:^|\\n)(?:#+\\s+)?(?:\\*\\*?\\s*)?${escapedHeader}(?:\\s*\\*\\*?)?(?:\\n|$)`, 'i')
    const matches = [...trimmed.matchAll(new RegExp(regex.source, 'gi'))]
    
    if (matches.length >= 2) {
      const secondMatchIdx = matches[1].index
      if (secondMatchIdx !== undefined && secondMatchIdx > 20) {
        return trimmed.substring(0, secondMatchIdx).trim()
      }
    }
  }

  // 3. General substring duplication check
  const middle = Math.floor(trimmed.length / 2)
  const leftPart = trimmed.substring(0, middle)
  const rightPart = trimmed.substring(middle)
  
  const rightLines = rightPart.split('\n').map(l => l.trim()).filter(l => l.length > 30)
  if (rightLines.length > 0) {
    const firstBigLine = rightLines[0]
    const leftIdx = leftPart.indexOf(firstBigLine)
    if (leftIdx >= 0 && leftIdx < 150) {
      const rightIdx = rightPart.indexOf(firstBigLine)
      if (rightIdx >= 0) {
        const boundary = middle + rightIdx
        return trimmed.substring(0, boundary).trim()
      }
    }
  }

  return trimmed
}

// ── Formatter to split subpoints (e.g. 3.1, 3.2) onto new lines ──
export function formatMarkdownSubpoints(text: string): string {
  if (!text) return ''
  let formatted = text.trim()
  
  // Replace space/newline followed by a subpoint (e.g. 3.1 or **3.1**) with a double newline BEFORE the bold marker
  formatted = formatted.replace(/(?:\s+)?(\*\*?\s*\d+\.\d+\.?\s*\*?)/g, (match, p1) => {
    return `\n\n${p1.trim()}`
  })
  
  // Make sure we don't have triple newlines
  formatted = formatted.replace(/\n{3,}/g, '\n\n')
  return formatted.trim()
}

// ── Mermaid Syntax Sanitizer (Core fix for Flow crashing with spaces and special characters) ──
export function sanitizeMermaidCode(code: string): string {
  if (!code) return ''
  let sanitized = code.trim()

  // Remove markdown block wraps if present
  sanitized = sanitized.replace(/^```mermaid\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '')

  const lines = sanitized.split('\n')
  const idMap: Record<string, string> = {}

  // Helper to make a clean, safe Mermaid ID
  const makeSafeId = (rawId: string): string => {
    const trimmed = rawId.trim()
    if (!trimmed) return 'node'
    if (idMap[trimmed]) return idMap[trimmed]
    
    // Replace non-alphanumeric with underscores
    let safe = trimmed.replace(/[^a-zA-Z0-9]/g, '_')
    // Remove consecutive underscores
    safe = safe.replace(/_+/g, '_')
    // Remove leading/trailing underscores
    safe = safe.replace(/^_+|_+$/g, '')
    
    // Mermaid IDs cannot start with numbers, prepend 'n_' if it does
    if (/^\d/.test(safe) || !safe) {
      safe = 'n_' + safe
    }
    idMap[trimmed] = safe
    return safe
  }

  // Pre-process definitions of shapes
  const shapeRegexes = [
    { regex: /([a-zA-Z0-9_\-\.\s\u00C0-\u024F]+)\s*\(\{\s*(.*?)\s*\}\)/g, open: '({', close: '})' },
    { regex: /([a-zA-Z0-9_\-\.\s\u00C0-\u024F]+)\s*\(\[\s*(.*?)\s*\]\)/g, open: '([', close: '])' },
    { regex: /([a-zA-Z0-9_\-\.\s\u00C0-\u024F]+)\s*\[\(\s*(.*?)\s*\)\]/g, open: '[(', close: ')]' },
    { regex: /([a-zA-Z0-9_\-\.\s\u00C0-\u024F]+)\s*\[\[\s*(.*?)\s*\]\]/g, open: '[[', close: ']]' },
    { regex: /([a-zA-Z0-9_\-\.\s\u00C0-\u024F]+)\s*\(\(\s*(.*?)\s*\)\)/g, open: '((', close: '))' },
    { regex: /([a-zA-Z0-9_\-\.\s\u00C0-\u024F]+)\s*\{\{\s*(.*?)\s*\}\}/g, open: '{{', close: '}}' },
    { regex: /([a-zA-Z0-9_\-\.\s\u00C0-\u024F]+)\s*\[\/\s*(.*?)\s*\/\]/g, open: '[/', close: '/]' },
    { regex: /([a-zA-Z0-9_\-\.\s\u00C0-\u024F]+)\s*\[\\\s*(.*?)\s*\\\]/g, open: '[\\', close: '\\]' },
    { regex: /([a-zA-Z0-9_\-\.\s\u00C0-\u024F]+)\s*\[\s*(.*?)\s*\]/g, open: '[', close: ']' },
    { regex: /([a-zA-Z0-9_\-\.\s\u00C0-\u024F]+)\s*\(\s*(.*?)\s*\)/g, open: '(', close: ')' },
    { regex: /([a-zA-Z0-9_\-\.\s\u00C0-\u024F]+)\s*\{\s*(.*?)\s*\}/g, open: '{', close: '}' },
    { regex: /([a-zA-Z0-9_\-\.\s\u00C0-\u024F]+)\s*(?<!-)(?<!=)>\s*(.*?)\s*\]/g, open: '>', close: ']' }
  ]

  // We will process line-by-line
  const processedLines = lines.map(line => {
    let currentLine = line
    const trimmed = currentLine.trim()

    // Ignore headers, subgraphs, styles, comments
    if (trimmed.startsWith('graph ') || 
        trimmed.startsWith('flowchart ') || 
        trimmed.startsWith('subgraph') || 
        trimmed === 'end' || 
        trimmed.startsWith('style') || 
        trimmed.startsWith('classDef') || 
        trimmed.startsWith('class') || 
        trimmed.startsWith('click') ||
        trimmed.startsWith('%%')) {
      return currentLine
    }

    // 1. Mask double-quoted strings
    const labels: string[] = []
    currentLine = currentLine.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
      labels.push(match)
      return `__LABEL_${labels.length - 1}__`
    })

    // 2. Run shape regexes on the masked line
    for (const shape of shapeRegexes) {
      currentLine = currentLine.replace(shape.regex, (match, rawId, labelPlaceholder) => {
        const safeId = makeSafeId(rawId)
        
        // Return the delayed label placeholder wrapped inside shape tags
        return `${safeId}${shape.open}###SHAPE_LABEL_${labelPlaceholder.trim()}###${shape.close}`
      })
    }

    // 3. Restore labels (both standard ones and shape labels)
    // First, process any shape labels
    currentLine = currentLine.replace(/###SHAPE_LABEL_(.*?)###/g, (match, inner) => {
      let labelContent = inner.trim()
      const placeholderMatch = labelContent.match(/^__LABEL_(\d+)__$/)
      
      if (placeholderMatch) {
        const idx = parseInt(placeholderMatch[1], 10)
        let origLabel = labels[idx]
        // Strip outer quotes of the original label
        if (origLabel.startsWith('"') && origLabel.endsWith('"')) {
          origLabel = origLabel.substring(1, origLabel.length - 1)
        }
        origLabel = origLabel.replace(/"/g, '\\"')
        labelContent = origLabel
      } else {
        // Unquoted label, escape quotes
        labelContent = labelContent.replace(/"/g, '\\"')
      }
      return `"${labelContent}"`
    })

    // Now restore any remaining unconsumed labels in the line
    currentLine = currentLine.replace(/__LABEL_(\d+)__/g, (match, idxStr) => {
      const idx = parseInt(idxStr, 10)
      return labels[idx]
    })

    return currentLine
  })

  // Register any remaining plain IDs that appear in connection lines but weren't defined with a shape
  const connectionRegex = /\s*(?:--o|--x|-->|==>|-\.-\.|-\.-\.>|<-->|-.->|---|==|->)\s*(?:\|[^|]+\|\s*)?/g
  processedLines.forEach(line => {
    const trimmed = line.trim()
    if (trimmed.startsWith('graph ') || 
        trimmed.startsWith('flowchart ') || 
        trimmed.startsWith('subgraph') || 
        trimmed === 'end' || 
        trimmed.startsWith('style') || 
        trimmed.startsWith('classDef') || 
        trimmed.startsWith('class') || 
        trimmed.startsWith('click') ||
        trimmed.startsWith('%%')) {
      return
    }

    // Mask labels again to avoid splitting on connection labels (e.g. |Aprobado|) or processing double quotes
    let tempLine = trimmed
    const labels: string[] = []
    tempLine = tempLine.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
      labels.push(match)
      return `__LABEL_${labels.length - 1}__`
    })

    // Split the line by connections to get node parts
    const parts = tempLine.split(connectionRegex)
    parts.forEach(part => {
      const cleanPart = part.trim()
      if (!cleanPart) return
      
      // If it contains shape characters or quotes, it was already handled or is a style line
      if (cleanPart.includes('[') || cleanPart.includes('(') || cleanPart.includes('{') || cleanPart.includes('"')) {
        return
      }

      // Restore any label placeholders in case they exist (they shouldn't in plain IDs)
      let restoredPart = cleanPart.replace(/__LABEL_(\d+)__/g, (match, idxStr) => {
        const idx = parseInt(idxStr, 10)
        return labels[idx]
      })

      // If it has spaces, dots, hyphens, etc., and isn't registered, register it
      if (restoredPart.includes(' ') || restoredPart.includes('.') || restoredPart.includes('-')) {
        makeSafeId(restoredPart)
      }
    })
  })

  // Second Pass: Safe replacement of node IDs using word boundaries and lookaround assertions
  const sortedRawIds = Object.keys(idMap).sort((a, b) => b.length - a.length)
  
  const finalLines = processedLines.map(line => {
    const trimmed = line.trim()
    
    if (trimmed.startsWith('graph ') || trimmed.startsWith('flowchart ') || trimmed.startsWith('%%')) {
      return line
    }

    let updatedLine = line

    // Mask labels to avoid replacing parts of labels
    const labels: string[] = []
    updatedLine = updatedLine.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
      labels.push(match)
      return `__LABEL_${labels.length - 1}__`
    })

    for (const rawId of sortedRawIds) {
      const safeId = idMap[rawId]
      const escapedRawId = rawId.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
      
      // Use lookbehind and lookahead to match only node IDs, not parts of labels or other node shapes
      const regex = new RegExp(`(?<=^|\\s|--|-->|==|==>|-\\.-|-\\.-:>|\\||<-->)(?:${escapedRawId})(?=$|\\s|--|-->|==|==>|-\\.-|-\\.-:>|\\||<-->|\\[|\\(|\\{|")`, 'g')
      updatedLine = updatedLine.replace(regex, safeId)
    }

    // Restore labels
    updatedLine = updatedLine.replace(/__LABEL_(\d+)__/g, (match, idxStr) => {
      const idx = parseInt(idxStr, 10)
      return labels[idx]
    })

    return updatedLine
  })

  // Ensure graph LR is prepended if no graph type is defined, and force horizontal layout (LR)
  let hasHeader = false
  const updatedFinalLines = finalLines.map(line => {
    const trimmed = line.trim()
    if (trimmed.startsWith('graph ') || trimmed.startsWith('flowchart ')) {
      hasHeader = true
      return trimmed.replace(/\b(TD|TB|BT|RL)\b/g, 'LR')
    }
    return line
  })

  if (!hasHeader) {
    return 'graph LR\n' + updatedFinalLines.map(l => '  ' + l).join('\n')
  }

  return updatedFinalLines.join('\n')
}
