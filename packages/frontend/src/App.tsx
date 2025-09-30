import React, { useState, useEffect } from 'react';
import Editor from './components/Editor';
import { apiFetch } from './api';
import {
  Box,
  Flex,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';

export default function App() {
  const [result, setResult] = useState('');
  // Concrete type for history items returned by the API
  type HistoryItem = {
    id: number;
    type: string;
    jobDescription?: string;
    resume?: string;
    output?: string;
    createdAt: string;
  };

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadHistory() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/history');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setHistory(data);
    } catch (e: unknown) {
      console.error(e);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const accent = useColorModeValue('robot.500', 'robot.100');

  return (
    <Box p={6} minH="100vh">
      <HStack mb={6} spacing={4} align="center">
        <Icon viewBox="0 0 24 24" boxSize={10} color={accent}>
          <rect x="4" y="7" width="16" height="10" rx="2" fill="currentColor" />
          <circle cx="8" cy="12" r="1.5" fill="#00171f" />
          <circle cx="16" cy="12" r="1.5" fill="#00171f" />
          <rect x="10" y="14" width="4" height="1.2" rx="0.6" fill="#00171f" />
          <rect x="11" y="3" width="2" height="3" rx="1" fill="currentColor" />
        </Icon>
        <Heading size="lg">Job Assistant — Robotic</Heading>
      </HStack>

      <Flex gap={6} align="flex-start">
        <Box flex={1}>
          <Card bg="gray.900" borderWidth={1} borderColor="gray.700">
            <CardHeader>
              <Heading size="md">Compose</Heading>
            </CardHeader>
            <CardBody>
              <Editor onResult={setResult} onDone={loadHistory} />
            </CardBody>
          </Card>
        </Box>

        <Box w="420px">
          <VStack align="stretch" spacing={4}>
            <Card bg="gray.900" borderWidth={1} borderColor="gray.700">
              <CardHeader>
                <Heading size="sm">Result</Heading>
              </CardHeader>
              <CardBody>
                <Box minH="160px" p={3} bg="blackAlpha.300" borderRadius="6px">
                  <Text whiteSpace="pre-wrap" fontFamily="inherit">
                    {result}
                  </Text>
                </Box>
                <HStack mt={3} spacing={2}>
                  <Button
                    variant="neon"
                    onClick={async () => await navigator.clipboard.writeText(result || '')}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="neon"
                    onClick={() =>
                      import('jspdf').then(({ jsPDF }) => {
                        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
                        const lines = doc.splitTextToSize(result || '', 500);
                        doc.text(lines, 40, 40);
                        doc.save('document.pdf');
                      })
                    }
                  >
                    PDF
                  </Button>
                </HStack>
              </CardBody>
            </Card>

            <Card bg="gray.900" borderWidth={1} borderColor="gray.700">
              <CardHeader>
                <Heading size="sm">History</Heading>
              </CardHeader>
              <CardBody>
                <HStack mb={2}>
                  <Button
                    variant="neon"
                    onClick={loadHistory}
                    leftIcon={loading ? <Spinner size="xs" /> : undefined}
                  >
                    Refresh
                  </Button>
                </HStack>
                <VStack spacing={2} align="stretch">
                  {history.map((h) => (
                    <HStack
                      key={h.id}
                      justify="space-between"
                      p={2}
                      bg="blackAlpha.300"
                      borderRadius="4px"
                    >
                      <Text fontSize="sm">
                        #{h.id} [{h.type}]
                      </Text>
                      <HStack>
                        <Text fontSize="xs">{new Date(h.createdAt).toLocaleString()}</Text>
                        <Button
                          size="sm"
                          variant="neon"
                          onClick={async () => {
                            const res = await apiFetch(`/api/history/${h.id}`);
                            const d = await res.json();
                            setResult(d.output || '');
                          }}
                        >
                          Load
                        </Button>
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
