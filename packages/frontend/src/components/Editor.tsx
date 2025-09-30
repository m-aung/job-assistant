import React, { useState } from 'react';
import { apiFetch } from '../api';
import {
  VStack,
  FormControl,
  FormLabel,
  Textarea,
  HStack,
  Button,
  useToast,
} from '@chakra-ui/react';

export default function Editor({
  onResult,
  onDone,
}: {
  onResult: (s: string) => void;
  onDone?: () => void;
}) {
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function callApi(path: string) {
    setLoading(true);
    try {
      const res = await apiFetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jobDescription }),
      });
      if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.error || 'Error: Unknown error');
      }
      const data = await res.json();
      onResult(data.coverLetter || data.rewrittenResume || JSON.stringify(data, null, 2));
      onDone?.();
    } catch (err: unknown) {
      onResult(String(err));
      toast({
        title: 'Error',
        description: String(err),
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel>Job Description</FormLabel>
        <Textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={6}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Resume</FormLabel>
        <Textarea value={resume} onChange={(e) => setResume(e.target.value)} rows={6} />
      </FormControl>
      <HStack>
        <Button variant="neon" isLoading={loading} onClick={() => callApi('/api/cover-letter')}>
          Cover Letter
        </Button>
        <Button variant="neon" isLoading={loading} onClick={() => callApi('/api/resume')}>
          Rewrite Resume
        </Button>
      </HStack>
    </VStack>
  );
}
