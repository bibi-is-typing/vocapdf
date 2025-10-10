import { useState } from 'react';
import { lookupWords, uploadFile } from './services/dictionaryApi';
import { generatePDF } from './utils/pdfGenerator';
import PDFPreview from './components/PDFPreview';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select } from './components/ui/select';
import { Textarea } from './components/ui/textarea';
import { Alert, AlertDescription } from './components/ui/alert';
import { Loader2 } from 'lucide-react';

function App() {
  const [words, setWords] = useState('');
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');
  const [appliedCefrLevel, setAppliedCefrLevel] = useState('A2');

  const [options, setOptions] = useState({
    meanings: 1,
    definitions: 1,
    synonyms: 0,
    antonyms: 0,
    related: 0,
    meaningDisplay: 'english',
    cefrLevel: 'A2',
    outputFormat: 'input-order',
    layoutType: 'study',
    includeCheckbox: false,
    includeNumbering: true,
    customDate: new Date().toISOString().split('T')[0]
  });

  const parseWords = (text) => {
    return text
      .split(/[\n,;]+/)
      .map(word => word.trim())
      .filter(word => word.length > 0);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      setProgress('파일을 불러오는 중이에요');

      const result = await uploadFile(file);
      setWords(result.data.words.join('\n'));
      setProgress('');
    } catch (err) {
      setError(err.response?.data?.error?.message || '파일을 불러오지 못했어요');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async () => {
    const wordList = parseWords(words);

    if (wordList.length === 0) {
      setError('단어를 먼저 입력해요');
      return;
    }

    if (wordList.length > 500) {
      setError('500개까지 입력할 수 있어요');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setProgress(`0/${wordList.length} 찾는 중이에요 (0%)`);

      const result = await lookupWords(wordList, options, (progressData) => {
        setProgress(`${progressData.processed}/${progressData.total} 찾는 중이에요 (${progressData.percentage}%)`);
      });

      setWordData(result.data);
      setAppliedCefrLevel(options.cefrLevel);
      setProgress('');
    } catch (err) {
      setError(err.response?.data?.error?.message || '단어를 찾지 못했어요. 네트워크를 확인하고 다시 시도해요');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = () => {
    if (!wordData || wordData.length === 0) {
      setError('먼저 단어를 찾아요');
      return;
    }

    try {
      setError(null);
      generatePDF(wordData, options);
    } catch (err) {
      setError(`PDF로 저장하지 못했어요 (${err.message})`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            {progress && <p className="mt-4 text-foreground font-medium">{progress}</p>}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-primary text-primary-foreground py-8 px-4 text-center shadow-md border-b">
        <h1 className="text-4xl font-bold">📚 VocaPDF</h1>
        <p className="mt-2 text-lg opacity-90">내 단어로 PDF를 바로 만들어요.</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>단어 입력</CardTitle>
            <CardDescription>단어, 숙어, 문장을 한 줄에 하나씩 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={words}
              onChange={(e) => setWords(e.target.value)}
              placeholder="단어, 숙어, 문장을 한 줄에 하나씩 입력해요.&#10;쉼표(,)나 세미콜론(;)으로도 구분할 수 있어요.&#10;100개 이하로 입력하면 더 빨라요."
              rows={12}
              className="font-mono"
            />

            <div className="bg-primary/10 border-l-4 border-primary rounded-md p-4">
              <Label htmlFor="cefrLevel" className="text-primary font-semibold">
                영어 수준을 선택해요.
              </Label>
              <Select
                id="cefrLevel"
                value={options.cefrLevel}
                onChange={(e) => setOptions({ ...options, cefrLevel: e.target.value })}
                className="mt-2"
              >
                <option value="A2">A2 (초급)</option>
                <option value="B1">B1 (중급)</option>
                <option value="B2">B2 (중상급)</option>
                <option value="C1">C1 (고급)</option>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleLookup}
                disabled={loading || !words.trim()}
                className="flex-1"
                size="lg"
              >
                {loading ? '찾는 중이에요.' : '단어 찾기'}
              </Button>

              <Label htmlFor="file-upload" className="flex-1">
                <div className="h-12 flex items-center justify-center bg-secondary text-secondary-foreground rounded-md font-semibold cursor-pointer hover:brightness-95 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  📁 파일 불러오기(txt,csv,md)
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".txt,.csv,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Section */}
        {wordData && wordData.length > 0 && (
          <>
            {/* Level Change Warning */}
            {options.cefrLevel !== appliedCefrLevel && (
              <Alert variant="warning" className="bg-accent/10 border-accent">
                <AlertDescription className="text-accent-foreground">
                  <p className="font-medium mb-2">⚠️ 선택한 수준이 바뀌었어요. 새 수준으로 다시 찾아요.</p>
                  <Button
                    onClick={handleLookup}
                    disabled={loading}
                    variant="default"
                    size="sm"
                  >
                    {options.cefrLevel} 수준으로 다시 찾기
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Layout Options */}
            <Card>
              <CardHeader>
                <CardTitle>보기 방식</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="layoutType">보기 유형</Label>
                  <Select
                    id="layoutType"
                    value={options.layoutType}
                    onChange={(e) => setOptions({ ...options, layoutType: e.target.value })}
                  >
                    <option value="study">학습용 (원문 + 예문/번역)</option>
                    <option value="memorization">암기용 (원문 + 빈칸)</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customDate">학습 날짜:</Label>
                  <Input
                    id="customDate"
                    type="date"
                    value={options.customDate}
                    onChange={(e) => setOptions({ ...options, customDate: e.target.value })}
                    className="max-w-xs"
                  />
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeCheckbox}
                      onChange={(e) => setOptions({ ...options, includeCheckbox: e.target.checked })}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm font-medium">체크박스 넣기</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeNumbering}
                      onChange={(e) => setOptions({ ...options, includeNumbering: e.target.checked })}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm font-medium">번호 넣기</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Preview Section */}
            <Card>
              <CardHeader>
                <CardTitle>미리 보기</CardTitle>
              </CardHeader>
              <CardContent>
                <PDFPreview
                  wordData={wordData}
                  options={options}
                  onGeneratePDF={handleGeneratePDF}
                />
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground text-center py-4 border-t">
        <p>❤️ VocaPDF로 만들었어요</p>
      </footer>
    </div>
  );
}

export default App;
