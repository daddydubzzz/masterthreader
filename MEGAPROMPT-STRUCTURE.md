# Modular Mega Prompt Structure

The mega prompt has been broken into logical, manageable files for better iteration and maintenance.

## File Structure

### Core Files

1. **`megaprompt-core.txt`** - Core thread generation instructions
   - Main Twitter thread creation guidelines
   - Hook requirements and cliffhanger rules
   - Output format specifications
   - Core POWER-TWEET definitions

2. **`megaprompt-style-rules.txt`** - Writing style and linguistic rules
   - Disallowed words and phrases
   - Brand positioning and tone guidelines
   - Scientific accuracy requirements
   - Formatting and output instructions

3. **`megaprompt-examples.txt`** - Twitter thread examples and guides
   - How-to guide for Twitter thread writing
   - Example threads with annotations
   - Structure and formatting examples

4. **`megaprompt-advanced-rules.txt`** - Advanced execution directives
   - Emotional amplification requirements
   - Neuroscience precision standards
   - Flow mechanism integration
   - Quality check protocols

## System Integration

### Automatic Loading
The system automatically loads and combines these files via:
- `src/lib/megaPrompts.ts` - Main loader with fallback to `megaprompt.txt`
- `src/lib/megaPromptLoader.ts` - Utility functions for manual operations

### Load Order
Files are combined in this logical sequence:
1. Core Instructions (fundamental rules)
2. Style Rules (writing guidelines)  
3. Examples (reference material)
4. Advanced Rules (execution details)

### Fallback Behavior
- If modular files are missing, system falls back to `megaprompt.txt`
- Graceful degradation ensures the system never breaks
- Console warnings indicate when fallback is used

## Benefits

### For Development
- **Targeted Editing**: Modify specific aspects without touching other rules
- **Better Version Control**: See exactly what changed in git diffs
- **Easier Collaboration**: Multiple people can work on different sections
- **Reduced Conflicts**: Less likely to have merge conflicts

### For Maintenance
- **Logical Organization**: Related rules grouped together
- **Faster Navigation**: Find specific rules quickly
- **Safer Updates**: Less risk of accidentally breaking other sections
- **Clearer Dependencies**: See how different rule sets interact

## Usage

### Making Changes
1. Edit the specific file containing the rules you want to change
2. The system automatically combines them on the next generation
3. Test your changes to ensure they work as expected

### Adding New Rules
- **Core functionality**: Add to `megaprompt-core.txt`
- **Writing style**: Add to `megaprompt-style-rules.txt`  
- **Examples**: Add to `megaprompt-examples.txt`
- **Advanced logic**: Add to `megaprompt-advanced-rules.txt`

### Creating Combined File
```typescript
import { saveCombinedMegaPrompt } from './src/lib/megaPromptLoader';
saveCombinedMegaPrompt(); // Creates megaprompt-combined.txt
```

## Migration Notes

- Original `megaprompt.txt` preserved as fallback
- All content has been preserved, just reorganized
- No functionality changes, only structural improvements
- System maintains backward compatibility

## Future Improvements

- Version control for individual modules
- A/B testing of different rule combinations
- Automated validation of rule consistency
- Dynamic rule loading based on use case 