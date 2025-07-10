#!/usr/bin/env node

/**
 * MasterThreader Learning Loop Test
 * 
 * This script tests the complete learning pipeline:
 * 1. Generate initial threads
 * 2. Simulate user edits
 * 3. Run recursion process
 * 4. Store patterns in vector database
 * 5. Generate new threads with learned patterns
 * 6. Verify improvement
 */

const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Test scenarios
const TEST_SCENARIOS = [
  {
    name: "Style Consistency Learning",
    script: "10 productivity tips for software developers",
    edits: [
      {
        original: "Use version control effectively",
        annotation: "Make this more actionable with specific steps",
        final: "Use version control effectively: commit small changes frequently, write clear commit messages, and create feature branches for new work"
      },
      {
        original: "Take regular breaks",
        annotation: "Add scientific backing and specific timing",
        final: "Take regular breaks: research shows 5-minute breaks every 25 minutes (Pomodoro Technique) boost focus and prevent burnout"
      }
    ],
    expectedImprovement: "More specific, actionable advice with examples"
  },
  {
    name: "Tone Adjustment Learning",
    script: "Benefits of remote work",
    edits: [
      {
        original: "Remote work is beneficial",
        annotation: "Make this more casual and personal",
        final: "Remote work has been a game-changer for me"
      },
      {
        original: "Companies should consider remote options",
        annotation: "More conversational tone",
        final: "If you're running a company, seriously consider remote options"
      }
    ],
    expectedImprovement: "More casual, personal tone"
  }
];

class LearningLoopTester {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '📝';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async testServerConnection() {
    try {
      await axios.get(`${BASE_URL}/api/analyze-patterns`);
      await this.log('Server connection successful', 'success');
      return true;
    } catch (error) {
      await this.log(`Server connection failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testDatabaseConnection() {
    try {
      await pool.query('SELECT NOW()');
      await this.log('Database connection successful', 'success');
      return true;
    } catch (error) {
      await this.log(`Database connection failed: ${error.message}`, 'error');
      return false;
    }
  }

  async generateInitialThreads(script) {
    try {
      const response = await axios.post(`${BASE_URL}/api/generate`, {
        script,
        megaPromptVersion: 'v1.0'
      });
      
      await this.log(`Generated ${response.data.threads.length} initial threads`);
      return response.data.threads;
    } catch (error) {
      await this.log(`Thread generation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async simulateUserEdits(threads, edits) {
    const editedThreads = threads.map((thread, index) => {
      if (index < edits.length) {
        const edit = edits[index];
        return {
          ...thread,
          content: edit.final,
          edits: [{
            id: `edit-${index}`,
            originalText: edit.original,
            editedText: edit.final,
            timestamp: new Date().toISOString()
          }],
          annotations: [{
            id: `annotation-${index}`,
            text: edit.annotation,
            type: 'improvement',
            timestamp: new Date().toISOString()
          }]
        };
      }
      return thread;
    });

    await this.log(`Simulated ${edits.length} user edits`);
    return editedThreads;
  }

  async runRecursion(threads, originalScript) {
    try {
      const response = await axios.post(`${BASE_URL}/api/recursion`, {
        originalScript: originalScript || "Test script",
        threads,
        megaPromptVersion: 'v1.0'
      });
      
      await this.log(`Recursion completed, got ${response.data.updatedThreads.length} improved threads`);
      return response.data;
    } catch (error) {
      await this.log(`Recursion failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async storeVectorPatterns(edits, scriptTitle) {
    try {
      for (const edit of edits) {
        await axios.post(`${BASE_URL}/api/capture-edit`, {
          original_tweet: edit.original,
          annotation: edit.annotation,
          final_edit: edit.final,
          quality_rating: 4,
          script_title: scriptTitle
        });
      }
      
      await this.log(`Stored ${edits.length} vector patterns`);
    } catch (error) {
      await this.log(`Vector storage failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async analyzePatterns() {
    try {
      const response = await axios.get(`${BASE_URL}/api/analyze-patterns`);
      const patterns = response.data.analysis?.recurring_patterns || [];
      await this.log(`Pattern analysis complete: ${patterns.length} patterns found`);
      return response.data;
    } catch (error) {
      await this.log(`Pattern analysis failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async generateNewThreads(script) {
    try {
      const response = await axios.post(`${BASE_URL}/api/generate`, {
        script,
        megaPromptVersion: 'v1.0'
      });
      
      await this.log(`Generated ${response.data.threads.length} new threads with learned patterns`);
      return response.data.threads;
    } catch (error) {
      await this.log(`New thread generation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async verifyImprovement(originalThreads, newThreads, scenario) {
    // Simple heuristic: check if new threads are longer and more detailed
    const originalAvgLength = originalThreads.reduce((sum, t) => sum + t.content.length, 0) / originalThreads.length;
    const newAvgLength = newThreads.reduce((sum, t) => sum + t.content.length, 0) / newThreads.length;
    
    const improvement = {
      lengthIncrease: newAvgLength > originalAvgLength,
      avgLengthDiff: newAvgLength - originalAvgLength,
      scenario: scenario.name,
      expectedImprovement: scenario.expectedImprovement
    };

    if (improvement.lengthIncrease && improvement.avgLengthDiff > 20) {
      await this.log(`✅ Improvement verified: ${improvement.avgLengthDiff} char increase`, 'success');
    } else {
      await this.log(`⚠️ Improvement unclear: ${improvement.avgLengthDiff} char difference`);
    }

    return improvement;
  }

  async runScenario(scenario) {
    await this.log(`\n🎯 Starting scenario: ${scenario.name}`);
    
    try {
      // Step 1: Generate initial threads
      const initialThreads = await this.generateInitialThreads(scenario.script);
      
      // Step 2: Simulate user edits
      const editedThreads = await this.simulateUserEdits(initialThreads, scenario.edits);
      
      // Step 3: Run recursion
      const recursionResult = await this.runRecursion(editedThreads, scenario.script);
      
      // Step 4: Store patterns
      await this.storeVectorPatterns(scenario.edits, scenario.name);
      
      // Step 5: Analyze patterns
      const patternAnalysis = await this.analyzePatterns();
      
      // Step 6: Generate new threads
      const newThreads = await this.generateNewThreads(scenario.script);
      
      // Step 7: Verify improvement
      const improvement = await this.verifyImprovement(initialThreads, newThreads, scenario);
      
      return {
        scenario: scenario.name,
        success: true,
        improvement,
        recursionResult,
        patternAnalysis
      };
      
    } catch (error) {
      await this.log(`Scenario failed: ${error.message}`, 'error');
      return {
        scenario: scenario.name,
        success: false,
        error: error.message
      };
    }
  }

  async runAllScenarios() {
    await this.log('🚀 Starting MasterThreader Learning Loop Test\n');
    
    // Check prerequisites
    if (!await this.testServerConnection()) return;
    if (!await this.testDatabaseConnection()) return;
    
    // Run all scenarios
    for (const scenario of TEST_SCENARIOS) {
      const result = await this.runScenario(scenario);
      this.results.push(result);
      
      // Wait between scenarios
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Generate report
    await this.generateReport();
  }

  async generateReport() {
    await this.log('\n📊 LEARNING LOOP TEST REPORT');
    await this.log('================================');
    
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);
    
    await this.log(`✅ Successful scenarios: ${successful.length}/${this.results.length}`);
    await this.log(`❌ Failed scenarios: ${failed.length}/${this.results.length}`);
    
    if (successful.length > 0) {
      await this.log('\n🎉 Successful Scenarios:');
      for (const result of successful) {
        await this.log(`  • ${result.scenario}: ${result.improvement.avgLengthDiff > 0 ? 'IMPROVED' : 'NO CHANGE'}`);
      }
    }
    
    if (failed.length > 0) {
      await this.log('\n⚠️ Failed Scenarios:');
      for (const result of failed) {
        await this.log(`  • ${result.scenario}: ${result.error}`);
      }
    }
    
    // Database stats
    try {
      const stats = await pool.query(`
        SELECT 
          COUNT(*) as total_patterns,
          COUNT(DISTINCT script_title) as unique_scripts,
          AVG(quality_rating) as avg_quality
        FROM vector_triples
      `);
      
      await this.log('\n📈 Database Statistics:');
      await this.log(`  • Total patterns stored: ${stats.rows[0].total_patterns}`);
      await this.log(`  • Unique scripts: ${stats.rows[0].unique_scripts}`);
      await this.log(`  • Average quality: ${parseFloat(stats.rows[0].avg_quality).toFixed(2)}`);
    } catch (error) {
      await this.log(`Database stats error: ${error.message}`, 'error');
    }
    
    const overallSuccess = failed.length === 0;
    await this.log(`\n${overallSuccess ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED'}`);
    
    return overallSuccess;
  }

  async cleanup() {
    await pool.end();
  }
}

// Run the test
async function main() {
  const tester = new LearningLoopTester();
  
  try {
    const success = await tester.runAllScenarios();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Test runner failed:', error);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

if (require.main === module) {
  main();
}

module.exports = { LearningLoopTester }; 